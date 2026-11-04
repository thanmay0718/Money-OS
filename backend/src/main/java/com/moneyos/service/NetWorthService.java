package com.moneyos.service;

import com.moneyos.dto.request.NetWorthItemRequest;
import com.moneyos.dto.response.NetWorthItemResponse;
import com.moneyos.dto.response.NetWorthSummaryResponse;
import com.moneyos.entity.User;

import java.util.UUID;

public interface NetWorthService {

    NetWorthSummaryResponse getNetWorthSummary(UUID userId);

    NetWorthItemResponse addItem(User user, NetWorthItemRequest request);

    void deleteItem(UUID userId, UUID itemId);
}
