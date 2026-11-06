package com.moneyos.service;

import com.moneyos.entity.Transaction;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.entity.UserCoinLedger;
import com.moneyos.repository.TransactionRepository;
import com.moneyos.repository.UserCoinLedgerRepository;
import com.moneyos.repository.UserRepository;
import com.moneyos.service.impl.CoinServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoinServiceImplTest {

    @Mock
    private UserCoinLedgerRepository coinLedgerRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private CoinServiceImpl coinService;

    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = new User("Test User", "test@moneyos.dev", "hash");
        ReflectionTestUtils.setField(user, "id", userId);
    }

    @Test
    void backfillTransactionCoins_savesMissingAwardsInOneBatch() {
        Transaction first = transaction("Salary");
        Transaction second = transaction("Groceries");
        when(transactionRepository.findByUserId(userId)).thenReturn(List.of(first, second));
        when(coinLedgerRepository.findAllByUser_IdAndReferenceType(userId, "TRANSACTION"))
                .thenReturn(List.of());
        when(userRepository.findById(userId)).thenReturn(java.util.Optional.of(user));

        coinService.backfillTransactionCoins(userId);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<UserCoinLedger>> awardsCaptor = ArgumentCaptor.forClass(List.class);
        verify(coinLedgerRepository).saveAll(awardsCaptor.capture());
        assertThat(awardsCaptor.getValue()).hasSize(2).allSatisfy(award -> {
            assertThat(award.getAmount()).isEqualTo(5);
            assertThat(award.getUser()).isSameAs(user);
            assertThat(award.getReferenceType()).isEqualTo("TRANSACTION");
        });
        verify(userRepository).findById(userId);
    }

    @Test
    void backfillTransactionCoins_skipsAlreadyAwardedTransactions() {
        Transaction transaction = transaction("Already awarded");
        UserCoinLedger existingAward = new UserCoinLedger(
                user,
                5,
                "Transaction recorded: Already awarded",
                "TRANSACTION",
                transaction.getId().toString()
        );
        when(transactionRepository.findByUserId(userId)).thenReturn(List.of(transaction));
        when(coinLedgerRepository.findAllByUser_IdAndReferenceType(userId, "TRANSACTION"))
                .thenReturn(List.of(existingAward));

        coinService.backfillTransactionCoins(userId);

        verify(coinLedgerRepository, never()).saveAll(any());
        verifyNoInteractions(userRepository);
    }

    private Transaction transaction(String description) {
        Transaction transaction = new Transaction(
                user,
                TransactionType.INCOME,
                BigDecimal.TEN,
                description,
                null,
                null,
                null,
                LocalDate.now()
        );
        ReflectionTestUtils.setField(transaction, "id", UUID.randomUUID());
        return transaction;
    }
}
