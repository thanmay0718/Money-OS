package com.moneyos.dto.response;

import java.util.List;
import java.util.Map;

public record AiChatResponse(
        String reply,
        String intent,
        List<String> suggestedFollowUps,
        Map<String, Object> dataSnapshot
) {}
