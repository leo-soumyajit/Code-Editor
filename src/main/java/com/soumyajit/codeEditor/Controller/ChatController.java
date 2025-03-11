package com.soumyajit.codeEditor.Controller;

import com.soumyajit.codeEditor.Advices.ApiResponse;
import com.soumyajit.codeEditor.Dtos.ChatRequest;
import com.soumyajit.codeEditor.Dtos.ChatResponse;
import com.soumyajit.codeEditor.Service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@RequestBody ChatRequest request) {
        String result = chatService.getChatResponse(request.getMessage());
        ChatResponse chatResponse = new ChatResponse(result);
        return ResponseEntity.ok(new ApiResponse<>(chatResponse));
    }
}
