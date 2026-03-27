package com.geu.findnet.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class NLPService {

    private final List<String> STOP_WORDS = Arrays.asList(
            "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "in", "on", "at", "to", "for", "with", "of", "this", "that", "it"
    );

    public double calculateSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;

        List<String> tokens1 = tokenizeAndRemoveStopWords(text1);
        List<String> tokens2 = tokenizeAndRemoveStopWords(text2);

        if (tokens1.isEmpty() || tokens2.isEmpty()) return 0.0;

        int matchCount = 0;
        for (String word1 : tokens1) {
            for (String word2 : tokens2) {
                if (word1.equals(word2)) {
                    matchCount++;
                    break;
                }
            }
        }

        double totalUniqueWords = tokens1.size() + tokens2.size() - matchCount;
        return (matchCount / totalUniqueWords) * 100.0;
    }

    private List<String> tokenizeAndRemoveStopWords(String text) {
        String[] words = text.toLowerCase().replaceAll("[^a-zA-Z0-9\\s]", "").split("\\s+");
        List<String> filteredList = new ArrayList<>();
        
        for (String word : words) {
            if (!STOP_WORDS.contains(word) && !word.isEmpty()) {
                filteredList.add(word);
            }
        }
        return filteredList;
    }
}
