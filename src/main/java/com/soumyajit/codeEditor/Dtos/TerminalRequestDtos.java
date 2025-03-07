package com.soumyajit.codeEditor.Dtos;

import lombok.Data;

@Data
public class TerminalRequestDtos {
    // For starting a new session (if code is provided)
    private String code;
    private String language;
    // For interactive input (if provided)
    private String input;
}
