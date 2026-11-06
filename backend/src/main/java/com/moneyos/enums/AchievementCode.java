package com.moneyos.enums;

public enum AchievementCode {
    FIRST_STEP("First Step", "Record your first financial transaction", "MILESTONE", "Sparkles", 1, 50),
    SMART_SAVER("Smart Saver", "Make your first savings goal contribution", "SAVINGS", "PiggyBank", 1, 75),
    CONSISTENCY_BUILDER("Consistency Builder", "Achieve 7 active financial days", "CONSISTENCY", "Flame", 7, 100),
    MONEY_DISCIPLINE("Money Discipline", "Achieve 30 active financial days", "CONSISTENCY", "ShieldCheck", 30, 250),
    GOAL_CRUSHER("Goal Crusher", "Successfully complete a savings goal", "SAVINGS", "Trophy", 1, 300),
    EMERGENCY_READY("Emergency Ready", "Fund an emergency goal", "SAVINGS", "Shield", 1, 200),
    MONEY_MANAGER("Money Manager", "Create and track a monthly budget", "BUDGET", "Target", 1, 100),
    BUDGET_MASTER("Budget Master", "Stay within budget for a complete month", "BUDGET", "Award", 1, 200);

    private final String title;
    private final String description;
    private final String category;
    private final String icon;
    private final int targetProgress;
    private final int coinReward;

    AchievementCode(String title, String description, String category, String icon, int targetProgress, int coinReward) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.icon = icon;
        this.targetProgress = targetProgress;
        this.coinReward = coinReward;
    }

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public String getIcon() { return icon; }
    public int getTargetProgress() { return targetProgress; }
    public int getCoinReward() { return coinReward; }
}
