package com.soumyajit.codeEditor.Service;

import org.springframework.stereotype.Service;

import javax.tools.*;
import java.io.*;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

@Service
public class CodeExecutionService {

    public String executeCode(String code, String language) {
        switch (language.toLowerCase()) {
            case "java":
                return executeJavaCode(code);
            case "python":
                return executePythonCode(code);
            case "c":
                return executeCCode(code);
            case "cpp":
                return executeCppCode(code);
            default:
                return "Unsupported language: " + language;
        }
    }

    //----------------------
    // Java code execution
    //----------------------
    private String executeJavaCode(String code) {
        Path tempDir = null;
        String fileName = "Main.java";
        try {
            // Create a temporary directory for Java source & class files
            tempDir = Files.createTempDirectory("java_exec_");
            Path sourceFile = tempDir.resolve(fileName);

            // Write the provided code to Main.java
            Files.write(sourceFile, code.getBytes(StandardCharsets.UTF_8));

            // Compile the Java source using javac
            ProcessBuilder compileBuilder = new ProcessBuilder("javac", fileName);
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectErrorStream(true);
            Process compileProcess = compileBuilder.start();
            String compileOutput = streamToString(compileProcess.getInputStream());
            int compileResult = compileProcess.waitFor();

            if (compileResult != 0) {
                return "Compilation error in " + fileName + ":\n" + compileOutput;
            }

            // Run the compiled class using java command
            ProcessBuilder runBuilder = new ProcessBuilder("java", "Main");
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectErrorStream(true);
            Process runProcess = runBuilder.start();
            String runOutput = streamToString(runProcess.getInputStream());
            runProcess.waitFor();
            return "File used: " + fileName + "\n" + runOutput;
        } catch (Exception e) {
            return "Error executing Java code: " + e.getMessage();
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    //----------------------
    // Python code execution
    //----------------------
    private String executePythonCode(String code) {
        Path tempDir = null;
        String fileName = "Main.py";
        try {
            // Create a temporary directory for Python source file
            tempDir = Files.createTempDirectory("python_exec_");
            Path sourceFile = tempDir.resolve(fileName);

            // Write the Python code to Main.py
            Files.write(sourceFile, code.getBytes(StandardCharsets.UTF_8));

            // Execute the Python script using the system Python interpreter
            ProcessBuilder runBuilder = new ProcessBuilder("python", fileName);
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectErrorStream(true);
            Process process = runBuilder.start();
            String output = streamToString(process.getInputStream());
            process.waitFor();

            return "File used: " + fileName + "\n" + output;
        } catch (Exception e) {
            return "Error executing Python code: " + e.getMessage();
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    //----------------------
    // C code execution
    //----------------------
    private String executeCCode(String code) {
        Path tempDir = null;
        String sourceFileName = "main.c";
        try {
            // Create a temporary directory for C source file
            tempDir = Files.createTempDirectory("c_exec_");
            Path sourceFile = tempDir.resolve(sourceFileName);

            // Write the C code to main.c
            Files.write(sourceFile, code.getBytes(StandardCharsets.UTF_8));

            // Compile with gcc: gcc main.c -o main
            ProcessBuilder compileBuilder = new ProcessBuilder("gcc.exe", "main.c", "-o", "main");
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectErrorStream(true);
            Process compileProcess = compileBuilder.start();
            String compileOutput = streamToString(compileProcess.getInputStream());
            int compileResult = compileProcess.waitFor();

            if (compileResult != 0) {
                return "Compilation error in main.c:\n" + compileOutput;
            }


            // Run the compiled binary
            ProcessBuilder runBuilder = new ProcessBuilder("./main");
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectErrorStream(true);
            Process runProcess = runBuilder.start();
            String runOutput = streamToString(runProcess.getInputStream());
            runProcess.waitFor();

            return "File used: " + sourceFileName + "\n" + runOutput;
        } catch (Exception e) {
            return "Error executing C code: " + e.getMessage();
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    //----------------------
    // C++ code execution
    //----------------------
    private String executeCppCode(String code) {
        Path tempDir = null;
        String sourceFileName = "main.cpp";
        try {
            // Create a temporary directory for C++ source file
            tempDir = Files.createTempDirectory("cpp_exec_");
            Path sourceFile = tempDir.resolve(sourceFileName);

            // Write the code to main.cpp
            Files.write(sourceFile, code.getBytes(StandardCharsets.UTF_8));

            // Compile with g++: g++ main.cpp -o main
            ProcessBuilder compileBuilder = new ProcessBuilder("g++", sourceFileName, "-o", "main");
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectErrorStream(true);
            Process compileProcess = compileBuilder.start();
            String compileOutput = streamToString(compileProcess.getInputStream());
            int compileResult = compileProcess.waitFor();

            if (compileResult != 0) {
                return "Compilation error in " + sourceFileName + ":\n" + compileOutput;
            }

            // Execute the compiled binary
            ProcessBuilder runBuilder = new ProcessBuilder("./main");
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectErrorStream(true);
            Process runProcess = runBuilder.start();
            String runOutput = streamToString(runProcess.getInputStream());
            runProcess.waitFor();

            return "File used: " + sourceFileName + "\n" + runOutput;
        } catch (Exception e) {
            return "Error executing C++ code: " + e.getMessage();
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir.toFile());
            }
        }
    }

    //----------------------
    // Utility methods:
    //----------------------
    private String streamToString(InputStream stream) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream))) {
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
            return output.toString();
        }
    }

    // Recursively delete a directory and its contents
    private void deleteDirectory(File directory) {
        File[] files = directory.listFiles();
        if (files != null) { // Check for non-empty directory
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDirectory(file);
                } else {
                    file.delete();
                }
            }
        }
        directory.delete();
    }

    // Optional: If you want an in-memory Java compiler (unused in this example),
    // you can use classes like JavaSourceFromString. For now, we use javac directly.
//    class JavaSourceFromString extends SimpleJavaFileObject {
//        final String code;
//        JavaSourceFromString(String name, String code) {
//            super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
//            this.code = code;
//        }
//        @Override
//        public CharSequence getCharContent(boolean ignoreEncodingErrors) {
//            return code;
//        }
//    }
}
