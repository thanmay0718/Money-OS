
package com.moneyos.service;

import com.moneyos.dto.request.MoneyPocketRequest;
import com.moneyos.dto.response.MoneyPocketResponse;

import java.util.List;
import java.util.UUID;

public interface MoneyPocketService {

    MoneyPocketResponse createPocket(
            UUID userId,
            MoneyPocketRequest request
    );

    List<MoneyPocketResponse> getMyPockets(UUID userId);
}
