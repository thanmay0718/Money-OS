package com.moneyos.service;

import com.moneyos.dto.request.ReceiptScanRequest;
import com.moneyos.dto.response.ReceiptScanResponse;
import com.moneyos.entity.Category;
import com.moneyos.entity.MoneyPocket;
import com.moneyos.entity.TransactionType;
import com.moneyos.entity.User;
import com.moneyos.repository.CategoryRepository;
import com.moneyos.repository.MoneyPocketRepository;
import com.moneyos.service.impl.ReceiptOcrServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReceiptOcrServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private MoneyPocketRepository pocketRepository;

    @InjectMocks
    private ReceiptOcrServiceImpl receiptOcrService;

    private UUID userId;
    private User testUser;
    private Category diningCategory;
    private MoneyPocket primaryPocket;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new User("John Doe", "john@example.com", "pass");
        diningCategory = new Category(testUser, "Food & Dining", TransactionType.EXPENSE);
        diningCategory.setId(UUID.randomUUID());
        primaryPocket = new MoneyPocket(testUser, "Main Wallet");
        primaryPocket.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("scanReceipt successfully extracts Starbucks merchant and amount")
    void testScanReceiptStarbucks() {
        when(categoryRepository.findAllByUser_IdAndTypeAndActiveTrue(eq(userId), eq(TransactionType.EXPENSE)))
                .thenReturn(List.of(diningCategory));
        when(pocketRepository.findAllByUser_IdAndActiveTrue(userId))
                .thenReturn(List.of(primaryPocket));

        ReceiptScanRequest request = new ReceiptScanRequest(null, "starbucks_receipt.jpg", "image/jpeg", null);

        ReceiptScanResponse response = receiptOcrService.scanReceipt(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.merchantName()).containsIgnoringCase("Starbucks");
        assertThat(response.amount()).isEqualByComparingTo("10.50");
        assertThat(response.taxAmount()).isEqualByComparingTo("0.80");
        assertThat(response.suggestedCategoryName()).isEqualTo("Food & Dining");
        assertThat(response.detectedItems()).isNotEmpty();
    }

    @Test
    @DisplayName("scanReceipt extracts custom raw text receipt accurately")
    void testScanReceiptRawText() {
        when(categoryRepository.findAllByUser_IdAndTypeAndActiveTrue(eq(userId), eq(TransactionType.EXPENSE)))
                .thenReturn(List.of(diningCategory));
        when(pocketRepository.findAllByUser_IdAndActiveTrue(userId))
                .thenReturn(List.of(primaryPocket));

        String rawReceipt = "DOWNTOWN BISTRO\nDate: 2026-11-02\n1x Pasta Carbonara $18.50\n1x Sparkling Water $3.50\nTax: $1.76\nTotal: $23.76";
        ReceiptScanRequest request = new ReceiptScanRequest(null, "dinner.jpg", "image/jpeg", rawReceipt);

        ReceiptScanResponse response = receiptOcrService.scanReceipt(userId, request);

        assertThat(response).isNotNull();
        assertThat(response.amount()).isEqualByComparingTo("23.76");
        assertThat(response.taxAmount()).isEqualByComparingTo("1.76");
        assertThat(response.suggestedCategoryName()).isEqualTo("Food & Dining");
    }
}
