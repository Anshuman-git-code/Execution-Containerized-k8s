from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import tempfile
import uuid
import shutil
import threading
import time
import signal

app = Flask(__name__)
CORS(app, resources={r"/run": {"origins": "*"}})

# Language configurations
LANGUAGE_CONFIGS = {
    "python": {
        "file_extension": ".py",
        "command": ["python", "{filename}"]
    },
    "javascript": {
        "file_extension": ".js",
        "command": ["node", "{filename}"]
    },
    "c": {
        "file_extension": ".c",
        "compile_command": ["gcc", "-o", "{executable}", "{filename}"],
        "run_command": ["./{executable}"]
    },
    "cpp": {
        "file_extension": ".cpp",
        "compile_command": ["g++", "-o", "{executable}", "{filename}"],
        "run_command": ["./{executable}"]
    },
    "java": {
        "file_extension": ".java",
        "compile_command": ["javac", "{filename}"],
        "run_command": ["java", "-cp", ".", "{classname}"]
    }
}

# Resource limits
EXECUTION_TIMEOUT = 10  # seconds
MAX_OUTPUT_SIZE = 1024 * 1024  # 1MB

class ResourceLimitedExecution:
    def __init__(self, command, cwd, input_data=None):
        self.command = command
        self.cwd = cwd
        self.input_data = input_data
        self.process = None
        self.stdout = ""
        self.stderr = ""
        self.returncode = None
        self.timed_out = False

    def run_with_timeout(self, timeout=EXECUTION_TIMEOUT):
        def target():
            self.process = subprocess.Popen(
                self.command,
                stdin=subprocess.PIPE if self.input_data else None,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=self.cwd,
                text=True,
                preexec_fn=os.setsid  # Use process group for better cleanup
            )
            
            self.stdout, self.stderr = self.process.communicate(
                input=self.input_data
            )
            self.returncode = self.process.returncode
        
        thread = threading.Thread(target=target)
        thread.start()
        thread.join(timeout)
        
        if thread.is_alive():
            # Kill the process group
            os.killpg(os.getpgid(self.process.pid), signal.SIGKILL)
            thread.join()
            self.timed_out = True
            self.stderr += "\nExecution timed out after {} seconds.".format(timeout)
            self.returncode = -1
        
        # Limit output size
        if len(self.stdout) > MAX_OUTPUT_SIZE:
            self.stdout = self.stdout[:MAX_OUTPUT_SIZE] + "\n... (output truncated)"
        if len(self.stderr) > MAX_OUTPUT_SIZE:
            self.stderr = self.stderr[:MAX_OUTPUT_SIZE] + "\n... (output truncated)"
        
        return self.returncode, self.stdout, self.stderr, self.timed_out

@app.route('/run', methods=['POST'])
def run_code():
    # Extract data from request
    data = request.json
    code = data.get('code', '')
    language = data.get('language', '').lower()
    stdin = data.get('stdin', '')
    
    # Validate input
    if not code:
        return jsonify({"error": "No code provided"}), 400
    
    if language not in LANGUAGE_CONFIGS:
        return jsonify({"error": f"Unsupported language: {language}. Supported languages: {', '.join(LANGUAGE_CONFIGS.keys())}"}), 400
    
    # Create a temporary directory with restricted permissions
    temp_dir = tempfile.mkdtemp(prefix="code_exec_")
    os.chmod(temp_dir, 0o700)  # Restrict permissions
    
    try:
        # Generate unique IDs for filenames
        execution_id = str(uuid.uuid4())
        filename = f"code_{execution_id}{LANGUAGE_CONFIGS[language]['file_extension']}"
        executable = f"executable_{execution_id}"
        filepath = os.path.join(temp_dir, filename)
        
        # Write code to file with restricted permissions
        with open(filepath, 'w') as f:
            f.write(code)
        os.chmod(filepath, 0o600)  # Read/write for owner only
        
        config = LANGUAGE_CONFIGS[language]
        result = {}
        
        # Handle compiled languages
        if language in ["c", "cpp"]:
            # Compile
            compile_command = [cmd.replace("{filename}", filename).replace("{executable}", executable) 
                              for cmd in config['compile_command']]
            
            compile_process = ResourceLimitedExecution(compile_command, temp_dir)
            compile_code, compile_stdout, compile_stderr, compile_timeout = compile_process.run_with_timeout(timeout=10)
            
            if compile_code != 0:
                return jsonify({
                    "stdout": compile_stdout,
                    "stderr": compile_stderr,
                    "exit_code": compile_code,
                    "status": "Compilation Error"
                })
            
            # Run
            run_command = [cmd.replace("{executable}", executable) for cmd in config['run_command']]
            execution = ResourceLimitedExecution(run_command, temp_dir, stdin)
            
        elif language == "java":
            # Extract class name
            import re
            class_match = re.search(r'public\s+class\s+(\w+)', code)
            if not class_match:
                return jsonify({"error": "Could not determine Java class name"}), 400
                
            class_name = class_match.group(1)
            
            # Compile
            compile_command = [cmd.replace("{filename}", filename) for cmd in config['compile_command']]
            compile_process = ResourceLimitedExecution(compile_command, temp_dir)
            compile_code, compile_stdout, compile_stderr, compile_timeout = compile_process.run_with_timeout(timeout=10)
            
            if compile_code != 0:
                return jsonify({
                    "stdout": compile_stdout,
                    "stderr": compile_stderr,
                    "exit_code": compile_code,
                    "status": "Compilation Error"
                })
                
            # Run
            run_command = [cmd.replace("{classname}", class_name) for cmd in config['run_command']]
            execution = ResourceLimitedExecution(run_command, temp_dir, stdin)
            
        else:
            # For interpreted languages
            run_command = [cmd.replace("{filename}", filename) for cmd in config['command']]
            execution = ResourceLimitedExecution(run_command, temp_dir, stdin)
        
        # Execute
        exit_code, stdout, stderr, timed_out = execution.run_with_timeout()
        
        status = "Success"
        if exit_code != 0:
            status = "Runtime Error"
        if timed_out:
            status = "Timeout Error"
            
        result = {
            "stdout": stdout,
            "stderr": stderr,
            "exit_code": exit_code,
            "status": status
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e), "status": "Server Error"}), 500
        
    finally:
        # Clean up temporary directory
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)