export const generatePrompt = (numWords, vocabLevel) => `
### Structure of a Single JSON Object:

1. "word" (String, source language): The vocabulary word in the source language.  
2. "meaning" (String, target language): Important and commonly used meanings of the word in the target language, separated by commas if multiple common meanings exist; otherwise, a single word.  
3. "part_of_speech" (String, source language): The part of speech of the word.  
4. "phonetic" (Object, target language): The pronunciation of the source language word written precisely in the target language script, described in a complete sentence, adhering to the target language's pronunciation standards. Use clear and accurate transcription to indicate how the word is pronounced in the target language. For example, if the source language is English and the target language is Persian, for a word like "cat," the phonetic value should be "کت". This is merely an example, and you must fill this field based on the chosen word. Do not use the word "cat"; it was only for illustration. You should randomly select words. The structure should be as follows:  
     - "short" (String, target language): The word that describes the pronunciation.  
     - "long" (String, target language): A sentence that describes the pronunciation.  
5. "etymology" (String, target language): The historical origin of the source language word, explained in the target language.  
6. "examples" (Array of Objects):  
   - For each meaning in the "meaning" field, provide 2 or 3 examples. The examples must correspond to the respective meaning and follow this structure:  
     - "sentence" (String, source language): A sample sentence in the source language.  
     - "translation" (String, target language): The precise translation of the sentence into the target language.  
7. "mnemonics" (Array of 3 Strings):  
   - Creative memorization explanations in the target language. It is very important that they are creative to aid memorization, incorporating humor, romance, poetry, or casual sentences that connect the word, its meaning, and especially its pronunciation.  
8. "collocations" (Array of 2 Objects): Common phrases that include the word, structured as follows:  
     - "sentence" (String, source language): A sample sentence in the source language.  
     - "translation" (String, target language): The precise translation of the sentence into the target language.  
9. "common_mistakes" (Array of 2 Strings, target language): Common mistakes made by learners who speak the target language and are learning the source language, explained in the target language.  
10. "formality_level" (String, source language): One of: "formal", "neutral", "informal".  
11. "cultural_notes" (String, target language): Notes about the cultural or situational use of the word.  
12. "gesture_association" (String, target language): A gesture or physical movement associated with the word.  
13. "emotional_connotation" (String, source language): One of: "positive", "negative", "neutral".  
14. "grammar_notes" (String, target language): Explanation of the grammatical usage of the word.  
15. "word_family" (Array of 2 Strings, source language): Words related to the word’s type.  
16. "variants" (Array of Strings, source language): Alternative spellings or pronunciations. If none exist, leave empty.  
17. "memory_strength" (Number): A number between 0 and 100 indicating the memorization strength.  
18. "spaced_repetition_dates" (Array of 3 Strings, Format: YYYY-MM-DD): Review dates based on today (today, tomorrow, one week later).  
19. "difficulty_level" (String, source language): One of: "Beginner", "Intermediate", "Advanced".  
20. "category" (String, source language): The thematic category.  
21. "synonyms" (Array of 2 Strings, source language): Synonyms of the word.  
22. "antonyms" (Array of 2 Strings, source language): Antonyms of the word.  
23. "usage_frequency" (String, source language): One of: "Common", "Uncommon", "Rare".  
24. "related_words" (Array of 2 Strings, source language): Words with related meanings.  
25. "source" (String, source language): The context of usage.  
26. "notes" (String, target language): Additional notes in the target language.  
27. "example_audio_url" (Array of Strings): Must always contain exactly this value and never change:  
    ["https://example.com/audio.mp3"]  
28. "is_deleted" (Boolean): Indicates whether the word is marked as deleted. Default: false.  
29. "correct_reviews" (Number): The number of correct reviews for the word. Default: 0. Do not change.  
30. "wrong_reviews" (Number): The number of incorrect reviews for the word. Default: 0. Do not change.

### Task:
- Generate exactly ${numWords} JSON objects that strictly follow this structure.  
- All words must be at the ${vocabLevel} level${vocabLevel === 'All' ? ' (any level from A1 to C2)' : ''}.  
- The source language is "English"; the JSON fields in the source language must be written in English.  
- The target language is "Persian"; the words in the source language must be translated into Persian, and the JSON fields in the target language must be written in Persian.  
- Produce only an array of JSON objects without any additional explanation.
`;