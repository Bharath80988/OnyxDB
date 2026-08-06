package com.onyxdb.api.cli;

import com.onyxdb.core.execution.ExecutionEngine;

import java.nio.file.Paths;
import java.util.*;

/**
 * Onyx Interactive Terminal CLI — a SQL-like REPL shell for OnyxDB.
 *
 * <p>Features:
 * <ul>
 *   <li>ANSI color prompt and result formatting.</li>
 *   <li>ASCII bordered table rendering for multi-field record results.</li>
 *   <li>Meta-commands: SHOW TABLES, DESCRIBE &lt;table&gt;, SHOW METRICS, CLEAR, HELP.</li>
 *   <li>Query execution benchmarking (nanosecond precision timing).</li>
 *   <li>Command auto-completion suggestions via {@code ?} suffix.</li>
 *   <li>Multi-line query support (queries terminated by ';').</li>
 * </ul>
 * </p>
 *
 * <p>Usage: {@code java -cp onyxdb-api-*.jar com.onyxdb.api.cli.OnyxCli [data-dir]}</p>
 */
public class OnyxCli {

    // ─── ANSI Color Constants ─────────────────────────────────────────────────────
    private static final String RESET  = "\u001B[0m";
    private static final String BOLD   = "\u001B[1m";
    private static final String CYAN   = "\u001B[36m";
    private static final String GREEN  = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String RED    = "\u001B[31m";
    private static final String DIM    = "\u001B[2m";
    private static final String WHITE  = "\u001B[97m";

    // ─── Known OQS / meta-command keywords for auto-completion ───────────────────
    private static final List<String> KEYWORDS = Arrays.asList(
        "GET", "FIND", "INSERT", "INSERT INTO", "UPDATE", "DELETE", "DELETE FROM",
        "INDEX", "INDEX ON", "EXPLAIN", "SELECT", "WHERE", "SET", "LIMIT",
        "SHOW TABLES", "SHOW METRICS", "DESCRIBE", "HELP", "CLEAR", "EXIT"
    );

    // ─── Entry Point ─────────────────────────────────────────────────────────────

    public static void main(String[] args) {
        String dataDir = args.length > 0 ? args[0] : System.getProperty("user.home") + "/OnyxDB/database";

        // ─── Startup banner ───────────────────────────────────────────────────────
        System.out.println(BOLD + CYAN +
            "╔══════════════════════════════════════════════════╗\n" +
            "║       OnyxDB Interactive Terminal  v4.0.0        ║\n" +
            "║   Type 'HELP' for commands, 'EXIT' to quit.      ║\n" +
            "╚══════════════════════════════════════════════════╝" + RESET);
        System.out.println(DIM + "  Storage: " + dataDir + RESET + "\n");

        try {
            ExecutionEngine engine = new ExecutionEngine(Paths.get(dataDir));
            Scanner scanner = new Scanner(System.in);
            StringBuilder multiLineBuffer = new StringBuilder();

            while (true) {
                // ─── Prompt ───────────────────────────────────────────────────────────
                String prompt = multiLineBuffer.length() > 0
                    ? CYAN + "  ->  " + RESET          // Continuation prompt for multi-line
                    : BOLD + CYAN + "onyx> " + RESET;  // Primary prompt
                System.out.print(prompt);

                if (!scanner.hasNextLine()) break;
                String line = scanner.nextLine();

                // ─── Exit commands ────────────────────────────────────────────────────
                if (line.trim().equalsIgnoreCase("exit") || line.trim().equalsIgnoreCase("quit")
                    || line.trim().equalsIgnoreCase("\\q")) {
                    System.out.println(CYAN + "Goodbye." + RESET);
                    break;
                }

                // ─── Multi-line query buffering (optional ';' terminator) ─────────────
                multiLineBuffer.append(line).append(" ");
                String buffered = multiLineBuffer.toString().trim();

                // If not terminated with ';' and not a meta-command, continue buffering
                boolean isMetaCommand = isMetaCommand(buffered);
                if (!isMetaCommand && !buffered.endsWith(";") && !isSingleLineStatement(buffered)) {
                    continue; // Wait for more input
                }

                // Strip trailing ';' before execution
                String input = buffered.endsWith(";") ? buffered.substring(0, buffered.length() - 1).trim() : buffered;
                multiLineBuffer.setLength(0); // Reset buffer after execution

                if (input.isEmpty()) continue;

                // ─── Auto-complete suggestions (?  suffix) ────────────────────────────
                if (input.endsWith("?") || input.endsWith("\t")) {
                    String prefix = input.substring(0, input.length() - 1).trim().toUpperCase();
                    printSuggestions(prefix);
                    continue;
                }

                // ─── Meta-commands ────────────────────────────────────────────────────
                if (handleMetaCommand(input, engine)) {
                    continue;
                }

                // ─── OQS / JSON query execution ───────────────────────────────────────
                try {
                    long startNs = System.nanoTime();
                    List<String> results = engine.execute(input);
                    double elapsedMs = (System.nanoTime() - startNs) / 1_000_000.0;

                    // Render results as ASCII table if records contain structured fields
                    printResultTable(results, input, elapsedMs);

                } catch (Exception e) {
                    System.out.println(RED + "ERROR: " + e.getMessage() + RESET);
                }
            }
        } catch (Exception e) {
            System.err.println(RED + "Failed to start Onyx CLI: " + e.getMessage() + RESET);
        }
    }

    // ─── Meta-Command Handler ─────────────────────────────────────────────────────

    /**
     * Handles all CLI meta-commands (SHOW TABLES, SHOW METRICS, DESCRIBE, HELP, CLEAR).
     * Algorithm: Case-insensitive prefix match for all supported meta-command tokens.
     *
     * @param input  Trimmed input string.
     * @param engine Live {@link ExecutionEngine} instance.
     * @return true if input was a meta-command and was handled, false otherwise.
     */
    private static boolean handleMetaCommand(String input, ExecutionEngine engine) {
        String upper = input.trim().toUpperCase();

        // ── SHOW TABLES ─────────────────────────────────────────────────────────
        if (upper.equals("SHOW TABLES") || upper.equals("\\TABLES") || upper.equals("\\T")) {
            Set<String> tableNames = engine.getTableNames();
            if (tableNames.isEmpty()) {
                System.out.println(DIM + "(No tables loaded yet.)" + RESET);
            } else {
                System.out.println(BOLD + "Active Tables:" + RESET);
                tableNames.stream().sorted().forEach(t -> System.out.println("  " + CYAN + t + RESET));
            }
            printRowCount(tableNames.size(), 0);
            return true;
        }

        // ── SHOW METRICS ─────────────────────────────────────────────────────────
        if (upper.equals("SHOW METRICS") || upper.equals("\\METRICS") || upper.equals("\\M")) {
            Map<String, Object> metrics = engine.getSystemMetrics();
            System.out.println(BOLD + "\nOnyxDB System Metrics:" + RESET);
            printMetricsTable(metrics);
            return true;
        }

        // ── DESCRIBE <table> ──────────────────────────────────────────────────────
        if (upper.startsWith("DESCRIBE ") || upper.startsWith("\\SCHEMA ") || upper.startsWith("DESC ")) {
            String tableName = input.trim().split("\\s+", 2)[1].trim();
            describeTable(tableName, engine);
            return true;
        }

        // ── HELP ──────────────────────────────────────────────────────────────────
        if (upper.equals("HELP") || upper.equals("\\H") || upper.equals("\\?") || upper.equals("\\HELP")) {
            printHelp();
            return true;
        }

        // ── CLEAR ─────────────────────────────────────────────────────────────────
        if (upper.equals("CLEAR") || upper.equals("\\CLEAR") || upper.equals("CLS")) {
            // ANSI escape sequence to clear terminal screen and reset cursor
            System.out.print("\033[H\033[2J");
            System.out.flush();
            return true;
        }

        return false;
    }

    /**
     * Returns true if the input string is a recognized meta-command prefix.
     */
    private static boolean isMetaCommand(String input) {
        String u = input.trim().toUpperCase();
        return u.startsWith("SHOW ") || u.equals("SHOW TABLES") || u.equals("SHOW METRICS")
            || u.startsWith("DESCRIBE ") || u.startsWith("\\")
            || u.equals("HELP") || u.equals("CLEAR") || u.equals("CLS");
    }

    /**
     * Returns true if the statement is a known single-line OQS command that does not need ';'.
     * This prevents buffering simple queries unnecessarily.
     */
    private static boolean isSingleLineStatement(String input) {
        String u = input.trim().toUpperCase();
        return u.startsWith("GET ") || u.startsWith("FIND ") || u.startsWith("DELETE ")
            || u.startsWith("INSERT ") || u.startsWith("UPDATE ") || u.startsWith("INDEX ")
            || u.startsWith("EXPLAIN ") || u.startsWith("{");
    }

    // ─── Table Describe ───────────────────────────────────────────────────────────

    /**
     * Displays information about a specific table: record count and foreign key constraints.
     *
     * @param tableName Name of the table to describe.
     * @param engine    Live engine instance for schema inspection.
     */
    private static void describeTable(String tableName, ExecutionEngine engine) {
        System.out.println(BOLD + "\nTable: " + CYAN + tableName + RESET);
        printDivider(50);

        // Show foreign key constraints
        var fks = engine.getSchemaManager().getChildConstraints(tableName);
        if (fks.isEmpty()) {
            System.out.println(DIM + "  No foreign key constraints defined." + RESET);
        } else {
            System.out.println(BOLD + "  Foreign Key Constraints:" + RESET);
            for (var fk : fks) {
                System.out.printf("    %s.%s → %s.%s  (%s)%n",
                    CYAN + fk.getChildTable() + RESET, fk.getChildField(),
                    CYAN + fk.getParentTable() + RESET, fk.getParentField(),
                    YELLOW + fk.getOnDelete() + RESET);
            }
        }
        System.out.println();
    }

    // ─── Result Rendering ─────────────────────────────────────────────────────────

    /**
     * Renders query results as an ASCII table if records contain parseable key=value pairs,
     * or as a simple list for single-value results (e.g. "Inserted 1 row.").
     *
     * <p>Algorithm:
     * <ol>
     *   <li>Attempt to parse each result string into column → value map pairs.</li>
     *   <li>Collect all distinct column names across all rows.</li>
     *   <li>Compute max column widths for uniform column padding.</li>
     *   <li>Print padded rows with ASCII border separators.</li>
     * </ol>
     * </p>
     *
     * @param results   List of result strings from the engine.
     * @param query     Original query string (used to detect EXPLAIN output).
     * @param elapsedMs Execution time in milliseconds.
     */
    private static void printResultTable(List<String> results, String query, double elapsedMs) {
        if (results.isEmpty()) {
            System.out.println(DIM + "(Empty set)" + RESET);
            printRowCount(0, elapsedMs);
            return;
        }

        // ── EXPLAIN / single-message results — render as plain list ──────────────
        boolean isPlain = results.stream().allMatch(r ->
            !r.contains("=") && !r.contains("{") && !r.contains(":")
        );
        boolean isExplain = query.trim().toUpperCase().startsWith("EXPLAIN");

        if (isPlain || isExplain) {
            for (String r : results) {
                System.out.println(isExplain ? YELLOW + r + RESET : "  " + r);
            }
            printRowCount(results.size(), elapsedMs);
            return;
        }

        // ── Parse records into column-value maps ──────────────────────────────────
        List<Map<String, String>> rows = new ArrayList<>();
        for (String record : results) {
            rows.add(parseRecord(record));
        }

        // ── Collect all column headers across all rows (preserve insertion order) ─
        List<String> columns = new ArrayList<>();
        for (Map<String, String> row : rows) {
            for (String key : row.keySet()) {
                if (!columns.contains(key)) columns.add(key);
            }
        }

        if (columns.isEmpty()) {
            // Fallback: render raw strings
            results.forEach(r -> System.out.println("  " + r));
            printRowCount(results.size(), elapsedMs);
            return;
        }

        // ── Compute max column widths for alignment ────────────────────────────────
        // Algorithm: max(header length, max value length) per column
        Map<String, Integer> colWidths = new LinkedHashMap<>();
        for (String col : columns) {
            int maxWidth = col.length();
            for (Map<String, String> row : rows) {
                String val = row.getOrDefault(col, "");
                maxWidth = Math.max(maxWidth, val.length());
            }
            colWidths.put(col, maxWidth);
        }

        // ── Print ASCII table header ──────────────────────────────────────────────
        String border = buildBorder(colWidths);
        System.out.println(border);

        // Column header row
        StringBuilder header = new StringBuilder("| ");
        for (String col : columns) {
            header.append(BOLD).append(padRight(col, colWidths.get(col))).append(RESET)
                  .append(" | ");
        }
        System.out.println(header);
        System.out.println(border);

        // ── Print data rows ───────────────────────────────────────────────────────
        for (Map<String, String> row : rows) {
            StringBuilder rowLine = new StringBuilder("| ");
            for (String col : columns) {
                String val = row.getOrDefault(col, "");
                rowLine.append(padRight(val, colWidths.get(col))).append(" | ");
            }
            System.out.println(rowLine);
        }
        System.out.println(border);

        // ── Result count and timing ───────────────────────────────────────────────
        printRowCount(results.size(), elapsedMs);
    }

    /**
     * Parses a record string into a map of column → value pairs.
     * Handles both JSON-like {@code {"key": "value"}} and toString-like {@code {key=value}} formats.
     *
     * @param record Raw record string from the engine.
     * @return Ordered map of field names to string values.
     */
    private static Map<String, String> parseRecord(String record) {
        Map<String, String> map = new LinkedHashMap<>();
        if (record == null || record.isBlank()) return map;

        // Strip outer braces
        String s = record.trim();
        if (s.startsWith("{")) s = s.substring(1);
        if (s.endsWith("}")) s = s.substring(0, s.length() - 1);

        // Split into key-value tokens, respecting quoted values
        String[] tokens = s.split(",\\s*");
        for (String token : tokens) {
            // Handle both "key": "value" and key=value formats
            int sepIdx = token.contains("=") ? token.indexOf('=') : token.indexOf(':');
            if (sepIdx > 0) {
                String key = token.substring(0, sepIdx).trim()
                    .replace("\"", "").replace("'", "");
                String val = token.substring(sepIdx + 1).trim()
                    .replace("\"", "").replace("'", "");
                if (!key.isEmpty()) {
                    map.put(key, val);
                }
            }
        }
        return map;
    }

    // ─── Metrics Table Renderer ───────────────────────────────────────────────────

    /**
     * Renders the system metrics map as a formatted key–value table.
     *
     * @param metrics Map of metric names to values.
     */
    @SuppressWarnings("unchecked")
    private static void printMetricsTable(Map<String, Object> metrics) {
        for (Map.Entry<String, Object> entry : metrics.entrySet()) {
            if (entry.getValue() instanceof Map) {
                // Nested table stats
                System.out.println(BOLD + "  " + entry.getKey() + ":" + RESET);
                Map<String, Object> subMap = (Map<String, Object>) entry.getValue();
                for (Map.Entry<String, Object> sub : subMap.entrySet()) {
                    System.out.printf("    %s%-30s%s %s%n",
                        CYAN, sub.getKey(), RESET, sub.getValue());
                }
            } else {
                System.out.printf("  %s%-35s%s %s%n",
                    YELLOW, entry.getKey(), RESET, entry.getValue());
            }
        }
        System.out.println();
    }

    // ─── Help Text ────────────────────────────────────────────────────────────────

    /** Prints the interactive help cheat-sheet. */
    private static void printHelp() {
        System.out.println(BOLD + "\n  Onyx Query Syntax (OQS) Reference:" + RESET);
        System.out.println(DIM + "  ─────────────────────────────────────────────────────────────" + RESET);
        printHelpRow("GET <table> <id>",              "Point lookup by primary key ID");
        printHelpRow("FIND <table> WHERE <f> = <v>",  "Filter records by field value");
        printHelpRow("EXPLAIN <query>",               "Show CBO execution plan and cost estimate");
        printHelpRow("INSERT INTO <table> {json}",    "Insert a new record (must include 'id')");
        printHelpRow("UPDATE <table> <id> SET k=v",   "Update record by ID");
        printHelpRow("DELETE <table> <id>",           "Delete record by ID");
        printHelpRow("INDEX <table> ON <field>",      "Create secondary B+ Tree index");
        System.out.println(BOLD + "\n  Meta-Commands:" + RESET);
        System.out.println(DIM + "  ─────────────────────────────────────────────────────────────" + RESET);
        printHelpRow("SHOW TABLES  / \\t",  "List all active tables");
        printHelpRow("SHOW METRICS / \\m",  "Display live system telemetry");
        printHelpRow("DESCRIBE <table>",    "Show table schema and foreign key constraints");
        printHelpRow("HELP / \\h",          "Show this help reference");
        printHelpRow("CLEAR / cls",         "Clear the terminal screen");
        printHelpRow("EXIT / quit",         "Exit the Onyx REPL shell");
        System.out.println(DIM + "\n  Tip: Append '?' to any prefix for auto-completion (e.g. 'F?').\n" + RESET);
    }

    private static void printHelpRow(String cmd, String desc) {
        System.out.printf("  %s%-38s%s %s%n", CYAN + BOLD, cmd, RESET + DIM, desc + RESET);
    }

    // ─── Auto-completion Suggestions ─────────────────────────────────────────────

    /**
     * Prints keyword auto-completion suggestions matching a given prefix.
     *
     * @param prefix The typed prefix to match against known keywords.
     */
    public static void printSuggestions(String prefix) {
        System.out.println(DIM + "\nSuggestions:" + RESET);
        boolean found = false;
        for (String kw : KEYWORDS) {
            if (prefix.isEmpty() || kw.startsWith(prefix)) {
                System.out.print("  " + CYAN + kw + RESET + "  ");
                found = true;
            }
        }
        if (!found) System.out.print(DIM + "(no matches)" + RESET);
        System.out.println("\n");
    }

    // ─── ASCII Rendering Utilities ────────────────────────────────────────────────

    /**
     * Builds an ASCII table border row from column widths.
     * Algorithm: for each column width w, output '+' + '-' * (w+2).
     *
     * @param colWidths Map of column name → max display width.
     * @return Border string like {@code +------+-------+-----+}.
     */
    private static String buildBorder(Map<String, Integer> colWidths) {
        StringBuilder sb = new StringBuilder("+");
        for (int width : colWidths.values()) {
            sb.append("-".repeat(width + 2)).append("+");
        }
        return sb.toString();
    }

    /**
     * Right-pads a string to the target width using spaces.
     * Algorithm: String.format left-align padding.
     *
     * @param s     Input string.
     * @param width Target minimum width.
     * @return Padded string.
     */
    private static String padRight(String s, int width) {
        return String.format("%-" + width + "s", s == null ? "" : s);
    }

    /** Prints the result row count and execution timing in psql-style. */
    private static void printRowCount(int count, double elapsedMs) {
        String countStr = count == 1 ? "1 row" : count + " rows";
        if (elapsedMs > 0) {
            System.out.println(GREEN + "(" + countStr + " in set, " + String.format("%.2f", elapsedMs) + " ms)" + RESET + "\n");
        } else {
            System.out.println(GREEN + "(" + countStr + " in set)" + RESET + "\n");
        }
    }

    /** Prints a simple horizontal divider. */
    private static void printDivider(int width) {
        System.out.println(DIM + "  " + "─".repeat(width) + RESET);
    }
}
