package com.moneyos.service.impl;

import com.moneyos.entity.Transaction;
import com.moneyos.entity.User;
import com.moneyos.entity.UserCoinLedger;
import com.moneyos.exception.ResourceNotFoundException;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserCoinLedgerRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.CoinService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CoinServiceImpl implements CoinService {

    private final UserCoinLedgerRepository coinLedgerRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public int getBalance(UUID userId) {
        Long sum = coinLedgerRepository.sumCoinsByUserId(userId);
        return sum != null ? sum.intValue() : 0;
    }

    @Override
    public boolean awardCoins(UUID userId, int amount, String reason, String referenceType, String referenceId) {
        if (amount <= 0) {
            return false;
        }

        // Strictly prevent duplicate awards
        if (coinLedgerRepository.existsByUser_IdAndReferenceTypeAndReferenceId(userId, referenceType, referenceId)) {
            log.debug("Coins already awarded for user {} and ref {}:{}", userId, referenceType, referenceId);
            return false;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserCoinLedger ledger = new UserCoinLedger(user, amount, reason, referenceType, referenceId);
        coinLedgerRepository.save(ledger);
        log.info("Awarded {} coins to user {} for reason: {}", amount, userId, reason);
        return true;
    }

    private static final List<RewardDefinition> REWARD_CATALOG = List.of(
            new RewardDefinition("THEME_OBSIDIAN", "Dark Obsidian Theme", "Midnight OLED minimalist palette for charts and surfaces", 100, "THEME", "Palette"),
            new RewardDefinition("THEME_LAVENDER_PRO", "Lavender Dawn Pro", "Signature champagne gold and lavender glass gradients", 150, "THEME", "Sparkles"),
            new RewardDefinition("THEME_EMERALD", "Emerald Frost Theme", "High-contrast emerald neon for savings and investments", 200, "THEME", "Shield"),
            new RewardDefinition("BADGE_VIP", "VIP Investor Badge", "Exclusive community badge displaying VIP supporter status", 250, "BADGE", "Award"),
            new RewardDefinition("PERK_CSV_PRO", "Audit Report Export", "Generate full PDF & CSV financial audit statements", 75, "PERK", "Download")
    );

    private record RewardDefinition(String code, String title, String description, int cost, String category, String icon) {}

    @Override
    @Transactional(readOnly = true)
    public List<com.moneyos.dto.response.RewardItemResponse> getAvailableRewards(UUID userId) {
        Set<String> redeemedCodes = new HashSet<>(
                coinLedgerRepository.findAllByUser_IdAndReferenceType(userId, "REWARD_REDEMPTION")
                        .stream()
                        .map(UserCoinLedger::getReferenceId)
                        .toList()
        );

        return REWARD_CATALOG.stream()
                .map(r -> new com.moneyos.dto.response.RewardItemResponse(
                        r.code(),
                        r.title(),
                        r.description(),
                        r.cost(),
                        r.category(),
                        r.icon(),
                        redeemedCodes.contains(r.code())
                ))
                .toList();
    }

    @Override
    public boolean redeemReward(UUID userId, String rewardCode) {
        RewardDefinition reward = REWARD_CATALOG.stream()
                .filter(r -> r.code().equalsIgnoreCase(rewardCode))
                .findFirst()
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Reward not found: " + rewardCode
                ));

        if (coinLedgerRepository.existsByUser_IdAndReferenceTypeAndReferenceId(userId, "REWARD_REDEMPTION", reward.code())) {
            return true; // Already redeemed
        }

        int currentBalance = getBalance(userId);
        if (currentBalance < reward.cost()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Insufficient coins. Required: " + reward.cost() + ", available: " + currentBalance
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserCoinLedger redemption = new UserCoinLedger(
                user,
                -reward.cost(),
                "Redeemed reward: " + reward.title(),
                "REWARD_REDEMPTION",
                reward.code()
        );

        coinLedgerRepository.save(redemption);
        log.info("User {} successfully redeemed {} for {} coins", userId, reward.code(), reward.cost());
        return true;
    }

    @Override
    public void backfillTransactionCoins(UUID userId) {
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        if (transactions.isEmpty()) {
            return;
        }

        Set<String> awardedTransactionIds = new HashSet<>(
                coinLedgerRepository.findAllByUser_IdAndReferenceType(userId, "TRANSACTION")
                        .stream()
                        .map(UserCoinLedger::getReferenceId)
                        .toList()
        );
        List<Transaction> transactionsToAward = transactions.stream()
                .filter(transaction -> !awardedTransactionIds.contains(transaction.getId().toString()))
                .toList();
        if (transactionsToAward.isEmpty()) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<UserCoinLedger> awards = transactionsToAward.stream().map(transaction -> {
            String reason = "Transaction recorded: " + (transaction.getDescription() != null
                    ? transaction.getDescription()
                    : "Activity");
            if (reason.length() > 200) {
                reason = reason.substring(0, 200);
            }
            return new UserCoinLedger(
                    user,
                    5,
                    reason,
                    "TRANSACTION",
                    transaction.getId().toString()
            );
        }).toList();

        coinLedgerRepository.saveAll(awards);
        log.info("Backfilled {} transaction coin awards for user {}", awards.size(), userId);
    }
}
