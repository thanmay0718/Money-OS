package com.moneyos.repository;

import com.moneyos.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TransactionRepositoryTest {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MoneyPocketRepository pocketRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    void sumVolumeByUserIdAndType_shouldIsolateUsersAndExcludeTransfers() {
        // User A
        User userA = userRepository.saveAndFlush(new User("User A", "userA@moneyos.dev", "hashA"));
        MoneyPocket pocketA = pocketRepository.saveAndFlush(new MoneyPocket(userA, "Pocket A"));
        Category catA = categoryRepository.saveAndFlush(new Category(userA, "Salary", TransactionType.INCOME));

        // User B
        User userB = userRepository.saveAndFlush(new User("User B", "userB@moneyos.dev", "hashB"));
        MoneyPocket pocketB = pocketRepository.saveAndFlush(new MoneyPocket(userB, "Pocket B"));
        Category catB = categoryRepository.saveAndFlush(new Category(userB, "Freelance", TransactionType.INCOME));

        // User A transactions: INCOME 5000, EXPENSE 1500, TRANSFER 2000
        transactionRepository.saveAndFlush(new Transaction(
                userA, TransactionType.INCOME, new BigDecimal("5000.00"), "Salary", catA, null, pocketA, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                userA, TransactionType.EXPENSE, new BigDecimal("1500.00"), "Rent", null, pocketA, null, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                userA, TransactionType.TRANSFER, new BigDecimal("2000.00"), "Internal Move", null, pocketA, pocketA, LocalDate.now()
        ));

        // User B transactions: INCOME 8000, EXPENSE 3000
        transactionRepository.saveAndFlush(new Transaction(
                userB, TransactionType.INCOME, new BigDecimal("8000.00"), "Project", catB, null, pocketB, LocalDate.now()
        ));
        transactionRepository.saveAndFlush(new Transaction(
                userB, TransactionType.EXPENSE, new BigDecimal("3000.00"), "Supplies", null, pocketB, null, LocalDate.now()
        ));

        // Verify User A aggregates
        BigDecimal incomeA = transactionRepository.sumVolumeByUserIdAndType(userA.getId(), TransactionType.INCOME);
        BigDecimal expenseA = transactionRepository.sumVolumeByUserIdAndType(userA.getId(), TransactionType.EXPENSE);

        assertThat(incomeA).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(expenseA).isEqualByComparingTo(new BigDecimal("1500.00"));

        // Verify User B aggregates
        BigDecimal incomeB = transactionRepository.sumVolumeByUserIdAndType(userB.getId(), TransactionType.INCOME);
        BigDecimal expenseB = transactionRepository.sumVolumeByUserIdAndType(userB.getId(), TransactionType.EXPENSE);

        assertThat(incomeB).isEqualByComparingTo(new BigDecimal("8000.00"));
        assertThat(expenseB).isEqualByComparingTo(new BigDecimal("3000.00"));

        // Verify user without transactions returns null
        User userC = userRepository.saveAndFlush(new User("User C", "userC@moneyos.dev", "hashC"));
        BigDecimal incomeC = transactionRepository.sumVolumeByUserIdAndType(userC.getId(), TransactionType.INCOME);
        assertThat(incomeC).isNull();
    }
}
