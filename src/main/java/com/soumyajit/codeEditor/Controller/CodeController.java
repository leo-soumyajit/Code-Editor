package com.soumyajit.codeEditor.Controller;

import com.soumyajit.codeEditor.Advices.ApiResponse;
import com.soumyajit.codeEditor.Dtos.CodeRequestDtos;
import com.soumyajit.codeEditor.Service.CodeExecutionService;
import com.soumyajit.codeEditor.Service.CodeAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class CodeController {

    private final CodeExecutionService codeExecutionService;
    private final CodeAiService codeAiService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<String>> executeCode(@RequestBody CodeRequestDtos codeRequest) {
        String result = codeExecutionService.executeCode(codeRequest.getCode(), codeRequest.getLanguage());
        ApiResponse<String> response = new ApiResponse<>(result);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/autocomplete")
    public ResponseEntity<ApiResponse<String>> autocomplete(@RequestBody String inputCode) {
        try {
            String suggestions = codeAiService.getAutocomplete(inputCode);
            ApiResponse<String> response = new ApiResponse<>(suggestions);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Error in autocomplete: " + e.getMessage()));
        }
    }

    @PostMapping("/code-analysis")
    public ResponseEntity<ApiResponse<String>> codeAnalysis(@RequestBody String code) {
        try {
            String analysis = codeAiService.getCodeAnalysis(code);
            ApiResponse<String> response = new ApiResponse<>(analysis);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>("Error in code analysis: " + e.getMessage()));
        }
    }
}
