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
public class CodeAiService {

    @Value("${spring.ai.model}")
    private String model;

    private final WebClient webClient;

    public CodeAiService(WebClient.Builder webClientBuilder,
                         @Value("${spring.ai.endpoint.base-url}") String baseUrl) {
        // Ensure your application.properties contains:
        // spring.ai.endpoint.base-url=http://localhost:11434/api
        // spring.ai.model=<your_model>
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    /**
     * Automatically detects the language from the code snippet using refined heuristics.
     *
     * @param code The input code snippet.
     * @return The detected language (e.g., "python", "java", "c", "c++").
     */
    private String detectLanguage(String code) {
        String lowerCode = code.toLowerCase();

        // Check for explicit Java signatures.
        if (lowerCode.contains("public class") || lowerCode.contains("import java") || lowerCode.contains("system.out.")) {
            return "java";
        }

        // If the code contains curly braces and semicolons, it's likely Java or C/C++.
        if (code.contains("{") && code.contains("}") && code.contains(";")) {
            // Further heuristic: if a class is declared with an uppercase letter (common in Java), choose Java.
            if (code.matches("(?s).*class\\s+[A-Z].*")) {
                return "java";
            }
            // Otherwise, assume C++ (or C)
            return "c++";
        }

        // Check for Python-specific keywords.
        if (lowerCode.contains("def ") || lowerCode.contains("print(") || lowerCode.contains("import ")) {
            return "python";
        }

        // Check for C/C++ indicators.
        if (lowerCode.contains("#include") || lowerCode.contains("cout <<") || lowerCode.contains("std::")) {
            return lowerCode.contains("class") && code.contains("{") ? "c++" : "c";
        }

        // Default fallback.
        return "python";
    }

    /**
     * Generates a corrected version of the provided code snippet.
     * Automatically detects the language, fixes syntax and formatting errors,
     * and returns only the corrected, runnable code.
     *
     * @param inputCode The broken code snippet.
     * @return The corrected code.
     */
    public String getAutocomplete(String inputCode) {
        String language = detectLanguage(inputCode);
        return getAutocomplete(inputCode, language);
    }

    /**
     * Generates a corrected version of the provided code snippet in the specified language.
     * The prompt instructs the AI to fix syntax, formatting, and indentation issues,
     * and to output only the corrected code with no extra commentary.
     *
     * @param inputCode The broken code snippet.
     * @param language  The detected language.
     * @return The corrected, runnable code.
     */
    public String getAutocomplete(String inputCode, String language) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("prompt", generatePrompt(inputCode, language));
        payload.put("max_tokens", 200);  // Increase if longer output is needed.
        payload.put("stream", true);

        String result = webClient.post()
                .uri("/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .onStatus(status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException("Ollama error: " + errorBody))))
                .bodyToFlux(OllamaResponse.class)
                .filter(resp -> resp.getResponse() != null)
                .map(OllamaResponse::getResponse)
                .reduce("", String::concat)
                .block();
        return result;
    }

    /**
     * Builds a tailored prompt based on the detected language.
     *
     * @param inputCode The original (broken) code snippet.
     * @param language  The detected language.
     * @return A prompt instructing the AI to output only the corrected code.
     */
    private String generatePrompt(String inputCode, String language) {
        String promptTemplate = "Fix the following %s code snippet so that it becomes valid, runnable, and properly formatted with correct newlines and indentation. " +
                "Do not include any extra commentary, markdown, or the original broken text—output only the corrected code:\n%s";
        String languageName;
        switch (language.toLowerCase()) {
            case "python":
                languageName = "Python";
                break;
            case "java":
                languageName = "Java";
                break;
            case "c":
                languageName = "C";
                break;
            case "c++":
                languageName = "C++";
                break;
            default:
                languageName = "code";
        }
        return String.format(promptTemplate, languageName, inputCode);
    }

    /**
     * Uses Ollama to analyze the provided code and suggest improvements.
     *
     * @param code The code snippet to analyze.
     * @return Suggestions for improvements.
     */
    public String getCodeAnalysis(String code) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("prompt", "Analyze the following code and suggest improvements:\n" + code);
        payload.put("max_tokens", 50);
        payload.put("stream", true);

        String result = webClient.post()
                .uri("/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .onStatus(status -> status.isError(),
                        response -> response.bodyToMono(String.class)
                                .flatMap(errorBody -> Mono.error(new RuntimeException("Ollama error: " + errorBody))))
                .bodyToFlux(OllamaResponse.class)
                .filter(resp -> resp.getResponse() != null)
                .map(OllamaResponse::getResponse)
                .reduce("", String::concat)
                .block();

        return result;
    }
}
