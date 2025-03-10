package com.soumyajit.codeEditor.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class CodeAiService {

    @Value("${spring.ai.api.key}")
    private String apiKey;

    @Value("${spring.ai.endpoint.base-url}")
    private String baseUrl;

    @Value("${spring.ai.model}")
    private String model;

    private final WebClient webClient;

    public CodeAiService(WebClient.Builder webClientBuilder) {
        // Build the WebClient using the provided base URL.
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Uses Google Gemini to generate autocomplete suggestions for the given code.
     */
    public String getAutocomplete(String inputCode) {
        // Build a payload JSON string. Adjust parameters such as max_tokens as desired.
        String payload = String.format(
                "{\"prompt\":\"%s\",\"max_tokens\":10, \"model\":\"%s\"}",
                inputCode, model);

        Mono<String> responseMono = webClient.post()
                .uri("/chat")  // Adjust endpoint if necessary (e.g., /generate)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class);

        return responseMono.block(); // Blocking for simplicity. Consider reactive handling in production.
    }

    /**
     * Uses Google Gemini to analyze the provided code and suggest improvements.
     */
    public String getCodeAnalysis(String code) {
        String payload = String.format(
                "{\"prompt\":\"Analyze the following code and suggest improvements:\\n%s\",\"max_tokens\":50, \"model\":\"%s\"}",
                code, model);

        Mono<String> responseMono = webClient.post()
                .uri("/chat")  // Adjust endpoint if necessary
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class);

        return responseMono.block();
    }
}
