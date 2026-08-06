package com.onyxdb.api.cli;

import com.onyxdb.core.execution.ExecutionEngine;

import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

/**
 * Interactive Terminal REPL CLI for OnyxDB featuring command auto-completion,
 * query execution (OQS/OQL/JSON), EXPLAIN profiling, and formatted result rendering.
 */
public class OnyxCli {

    private static final List<String> COMMAND_KEYWORDS = Arrays.asList(
            "GET", "FIND", "INSERT", "UPDATE", "DELETE", "INDEX", "EXPLAIN", "SELECT", "WHERE", "SET", "ON", "HELP", "EXIT", "QUIT"
    );

    public static void main(String[] args) {
        String dataDir = args.length > 0 ? args[0] : "./onyx_data";
        System.out.println("=================================================");
        System.out.println("  OnyxDB Interactive Terminal REPL (v4.0.0)");
        System.out.println("  Type 'help' for available commands, 'exit' to quit");
        System.out.println("=================================================");

        try {
            ExecutionEngine engine = new ExecutionEngine(Paths.get(dataDir));
            Scanner scanner = new Scanner(System.in);

            while (true) {
                System.out.print("onyx> ");
                if (!scanner.hasNextLine()) break;

                String input = scanner.nextLine().trim();
                if (input.isEmpty()) continue;

                if (input.equalsIgnoreCase("exit") || input.equalsIgnoreCase("quit")) {
                    System.out.println("Goodbye!");
                    break;
                }

                if (input.equalsIgnoreCase("help")) {
                    printHelp();
                    continue;
                }

                // Handle basic tab-like auto-completion suggestion
                if (input.endsWith("\t") || input.endsWith("?")) {
                    String prefix = input.substring(0, input.length() - 1).trim().toUpperCase();
                    printSuggestions(prefix);
                    continue;
                }

                try {
                    long startTime = System.nanoTime();
                    List<String> results = engine.execute(input);
                    long elapsedMs = (System.nanoTime() - startTime) / 1_000_000;

                    System.out.println("-------------------------------------------------");
                    if (results.isEmpty()) {
                        System.out.println("(No records returned)");
                    } else {
                        for (int i = 0; i < results.size(); i++) {
                            System.out.printf("[%d] %s%n", i + 1, results.get(i));
                        }
                    }
                    System.out.println("-------------------------------------------------");
                    System.out.printf("(%d rows in set, %d ms)%n%n", results.size(), elapsedMs);
                } catch (Exception e) {
                    System.err.println("Error: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to start Onyx CLI: " + e.getMessage());
        }
    }

    private static void printHelp() {
        System.out.println("\nOnyx Query Syntax (OQS) Quick Reference:");
        System.out.println("  GET <table > <id>                     Fetch record by Primary Key ID");
        System.out.println("  FIND <table> WHERE <field> = <val>    Query records matching field condition");
        System.out.println("  EXPLAIN FIND <table> WHERE ...       Output Cost-Based Optimizer (CBO) execution plan");
        System.out.println("  INSERT INTO <table> { \"id\": 1, ... } Insert record with JSON body");
        System.out.println("  UPDATE <table> <id> SET <k> = <v>    Update record by ID");
        System.out.println("  DELETE <table> <id>                  Delete record by ID");
        System.out.println("  INDEX <table> ON <field>             Create secondary B+ Tree index");
        System.out.println("  exit / quit                          Exit the REPL shell\n");
    }

    public static void printSuggestions(String prefix) {
        System.out.println("\nSuggested completions:");
        for (String kw : COMMAND_KEYWORDS) {
            if (prefix.isEmpty() || kw.startsWith(prefix)) {
                System.out.print(kw + "  ");
            }
        }
        System.out.println();
    }
}
