package com.soumyajit.codeEditor.Controller;

import com.soumyajit.codeEditor.Advices.ApiResponse;
import com.soumyajit.codeEditor.Dtos.CodeRequestDtos;
import com.soumyajit.codeEditor.Service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")
public class CodeController {

    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<String>> executeCode(@RequestBody CodeRequestDtos codeRequest) {
        String result = codeExecutionService.executeCode(codeRequest.getCode(), codeRequest.getLanguage());
        ApiResponse<String> response = new ApiResponse<>(result);
        return ResponseEntity.ok(response);
    }


}
