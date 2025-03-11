package com.soumyajit.codeEditor.Service;

import com.soumyajit.codeEditor.Dtos.OllamaResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
public class ChatService {

    @Value("${spring.ai.model}")
    private String model;

    private final WebClient webClient;

    public ChatService(WebClient.Builder webClientBuilder,
                       @Value("${spring.ai.endpoint.base-url}") String baseUrl) {
        // For example, baseUrl could be "http://localhost:11434/api"
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public String getChatResponse(String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        // For the chatbot, we use the user's message as the prompt.
        payload.put("prompt", message);
        payload.put("max_tokens", 150);
        payload.put("stream", false);

        // Call the Ollama endpoint.
        // Here we assume that the endpoint returns a single JSON object mapped to OllamaResponse.
        String response = webClient.post()
                .uri("/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(OllamaResponse.class)
                .map(OllamaResponse::getResponse)
                .block();
        return response;
    }
}
