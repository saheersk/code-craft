import os
from abc import ABC, abstractmethod
import subprocess


class LanguageExecutor(ABC):
    @abstractmethod
    def setup_code(self, source_code: str, stdin: str, sandbox_dir: str):
        pass

    @abstractmethod
    def execute(self, sandbox_dir: str) -> subprocess.CompletedProcess:
        pass


class JavaScriptExecutor(LanguageExecutor):
    def setup_code(self, source_code: str, stdin: str, sandbox_dir: str):
        script_path = os.path.join(sandbox_dir, "script.js")
        input_file_path = os.path.join(sandbox_dir, "input.txt")

        with open(script_path, 'w') as f:
            f.write(source_code)

        with open(input_file_path, 'w') as f:
            f.write(stdin.strip())

    def execute(self, sandbox_dir: str) -> subprocess.CompletedProcess:
        run_command = [
            "docker", "run", "--rm",
            "-v", f"{sandbox_dir}:/sandbox",
            "--memory=128m", "--cpus=0.5",
            "--network=none", "node:23-alpine",
            "node", "/sandbox/script.js"
        ]
        return subprocess.run(run_command, text=True, capture_output=True, timeout=30)


class CppExecutor(LanguageExecutor):
    def setup_code(self, source_code: str, stdin: str, sandbox_dir: str):
        script_path = os.path.join(sandbox_dir, "script.cpp")
        input_file_path = os.path.join(sandbox_dir, "input.txt")

        with open(input_file_path, 'w') as f:
            f.write(stdin.strip().replace('\n', ' ').strip())

        with open(script_path, 'w') as f:
            f.write(source_code)

    def execute(self, sandbox_dir: str) -> subprocess.CompletedProcess:
        run_command = [
            "docker", "run", "--rm",
            "-v", f"{sandbox_dir}:/sandbox",
            "--memory=128m", "--cpus=0.5",
            "--network=none", "gcc:latest",
            "bash", "-c", "g++ /sandbox/script.cpp -o /sandbox/output && /sandbox/output < /sandbox/input.txt"
        ]
        return subprocess.run(run_command, text=True, capture_output=True, timeout=30)


class RustExecutor(LanguageExecutor):
    def setup_code(self, source_code: str, stdin: str, sandbox_dir: str):
        script_path = os.path.join(sandbox_dir, "script.rs")
        input_file_path = os.path.join(sandbox_dir, "input.txt")

        with open(input_file_path, 'w') as f:
            f.write(stdin.strip())

        with open(script_path, 'w') as f:
            f.write(source_code)

    def execute(self, sandbox_dir: str) -> subprocess.CompletedProcess:
        run_command = [
            "docker", "run", "--rm",
            "-v", f"{sandbox_dir}:/sandbox",
            "--memory=128m", "--cpus=0.5",
            "--network=none", "rust:latest",
            "bash", "-c", "rustc /sandbox/script.rs -o /sandbox/output && /sandbox/output < /sandbox/input.txt"
        ]
        return subprocess.run(run_command, text=True, capture_output=True, timeout=30)  


class LanguageExecutorFactory:
    @staticmethod
    def get_executor(language_id: int) -> LanguageExecutor:
        if language_id == 1:  # JavaScript
            return JavaScriptExecutor()
        elif language_id == 2:  # C++
            return CppExecutor()
        elif language_id == 3:  # Rust
            return RustExecutor()
        else:
            raise ValueError("Unsupported language_id")
