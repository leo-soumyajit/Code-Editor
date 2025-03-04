package com.soumyajit.codeEditor.Controller;

import com.soumyajit.codeEditor.Dtos.CodeRequestDtos;
import com.soumyajit.codeEditor.Service.CodeExecutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/code")
@RequiredArgsConstructor
public class CodeController {


    private final CodeExecutionService codeExecutionService;

    @PostMapping("/execute")
    public String executeCode(@RequestBody CodeRequestDtos codeRequest) {
        return codeExecutionService.executeCode(codeRequest.getCode(), codeRequest.getLanguage());
    }
}
