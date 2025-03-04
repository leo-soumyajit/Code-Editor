package com.soumyajit.codeEditor.Dtos;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CodeRequestDtos {
    private String code;
    private String language;
}
