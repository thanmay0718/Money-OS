package com.moneyos.service.impl;

import com.moneyos.dto.request.NetWorthItemRequest;
import com.moneyos.dto.response.MoneyPocketResponse;
import com.moneyos.dto.response.NetWorthItemResponse;
import com.moneyos.dto.response.NetWorthSummaryResponse;
import com.moneyos.entity.NetWorthItem;
import com.moneyos.entity.User;
import com.moneyos.enums.NetWorthType;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.NetWorthItemRepository;
import com.moneyos.service.MoneyPocketService;
import com.moneyos.service.NetWorthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NetWorthServiceImpl implements NetWorthService {

    private final NetWorthItemRepository itemRepository;
    private final MoneyPocketService pocketService;

    @Override
    @Transactional(readOnly = true)
    public NetWorthSummaryResponse getNetWorthSummary(UUID userId) {
        // 1. Calculate liquid assets from active user pockets
        List<MoneyPocketResponse> pockets = pocketService.getMyPockets(userId);
        BigDecimal liquidPockets = BigDecimal.ZERO;
        if (pockets != null) {
            for (MoneyPocketResponse p : pockets) {
                if (p.active() && p.balance() != null) {
                    liquidPockets = liquidPockets.add(p.balance());
                }
            }
        }

        // 2. Fetch manual assets and liabilities
        List<NetWorthItem> items = itemRepository.findAllByUserIdOrderByCreatedAtDesc(userId);

        BigDecimal manualAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;
        Map<String, BigDecimal> assetsByCategory = new HashMap<>();
        Map<String, BigDecimal> liabilitiesByCategory = new HashMap<>();

        // Add liquid pockets to assets category breakdown
        assetsByCategory.put("Liquid Cash / Pockets", liquidPockets);

        for (NetWorthItem item : items) {
            BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;
            String cat = (item.getCategory() != null && !item.getCategory().isBlank()) ? item.getCategory() : "Other";

            if (item.getType() == NetWorthType.ASSET) {
                manualAssets = manualAssets.add(amt);
                assetsByCategory.put(cat, assetsByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            } else {
                totalLiabilities = totalLiabilities.add(amt);
                liabilitiesByCategory.put(cat, liabilitiesByCategory.getOrDefault(cat, BigDecimal.ZERO).add(amt));
            }
        }

        BigDecimal totalAssets = liquidPockets.add(manualAssets);
        BigDecimal netWorth = totalAssets.subtract(totalLiabilities);

        List<NetWorthItemResponse> itemResponses = items.stream()
                .map(this::toResponse)
                .toList();

        return new NetWorthSummaryResponse(
                totalAssets,
                totalLiabilities,
                netWorth,
                liquidPockets,
                manualAssets,
                assetsByCategory,
                liabilitiesByCategory,
                itemResponses
        );
    }

    @Override
    @Transactional
    public NetWorthItemResponse addItem(User user, NetWorthItemRequest request) {
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Amount cannot be negative");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item name is required");
        }
        if (request.type() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type (ASSET or LIABILITY) is required");
        }

        String cat = (request.category() != null && !request.category().isBlank())
                ? request.category().trim().toUpperCase()
                : "OTHER";

        NetWorthItem item = new NetWorthItem(user, request.name().trim(), request.type(), cat, request.amount());
        NetWorthItem saved = itemRepository.save(item);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteItem(UUID userId, UUID itemId) {
        NetWorthItem item = itemRepository.findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Net worth item not found"));
        itemRepository.delete(item);
    }

    private NetWorthItemResponse toResponse(NetWorthItem item) {
        return new NetWorthItemResponse(
                item.getId(),
                item.getName(),
                item.getType(),
                item.getCategory(),
                item.getAmount(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
