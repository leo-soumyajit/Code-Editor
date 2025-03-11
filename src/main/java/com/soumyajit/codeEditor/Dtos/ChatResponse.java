package com.soumyajit.codeEditor.Dtos;

import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
public class ChatResponse {
    private String response;

    public ChatResponse(String response) {
        this.response = response;
    }

    public ChatResponse() {
    }
}
