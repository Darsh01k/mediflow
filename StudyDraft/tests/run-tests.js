const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function runTests() {
  console.log("=".repeat(60));
  console.log("  StudyDraft Test Suite");
  console.log("=".repeat(60));
  console.log();

  const testReport = {
    appName: "StudyDraft",
    testDate: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
    tests: [],
  };

  const testFiles = [
    "tests/auth.test.ts",
    "tests/report-creation.test.ts",
    "tests/export.test.ts",
    "tests/reference-flow.test.ts",
    "tests/usage-limits.test.ts",
  ];

  for (const file of testFiles) {
    console.log(`\n  Running: ${file}`);
    let output = "";
    try {
      output = execSync(
        `npx vitest run ${file} --reporter=json 2>&1`,
        { encoding: "utf8", cwd: __dirname }
      );
    } catch (e) {
      output = e.stdout || e.message || "";
    }

    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        for (const testResult of result.testResults || []) {
          for (const assertion of testResult.assertionResults || []) {
            const status = assertion.status === "passed" ? "PASSED" : "FAILED";
            testReport.summary.total++;
            if (assertion.status === "passed") {
              testReport.summary.passed++;
            } else {
              testReport.summary.failed++;
            }
            testReport.tests.push({
              testName: assertion.fullName || assertion.title,
              status,
              errorDetails: assertion.failureMessages?.join("\n") || "",
              timestamp: new Date().toISOString(),
              file,
            });
            console.log(`    ${status}: ${assertion.title}`);
          }
        }
      } else {
        console.log(`    Could not parse results for ${file}`);
        const status = output.includes("FAIL") ? "FAILED" : output.includes("PASS") ? "PASSED" : "UNKNOWN";
        testReport.summary.total++;
        if (status === "PASSED") {
          testReport.summary.passed++;
        } else {
          testReport.summary.failed++;
        }
        testReport.tests.push({
          testName: file,
          status,
          errorDetails: output.includes("FAIL") ? output : "",
          timestamp: new Date().toISOString(),
          file,
        });
        console.log(`    ${status}: ${file}`);
      }
    } catch (e) {
      testReport.summary.total++;
      testReport.summary.failed++;
      testReport.tests.push({
        testName: file,
        status: "FAILED",
        errorDetails: e.message,
        timestamp: new Date().toISOString(),
        file,
      });
      console.log(`    FAILED: ${file}`);
    }
  }

  const reportPath = path.join(__dirname, "test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));

  console.log();
  console.log("=".repeat(60));
  console.log("  Test Summary");
  console.log("=".repeat(60));
  console.log(`  Total:  ${testReport.summary.total}`);
  console.log(`  Passed: ${testReport.summary.passed}`);
  console.log(`  Failed: ${testReport.summary.failed}`);
  console.log();
  console.log(`  Report saved to: ${reportPath}`);
  console.log("=".repeat(60));
}

runTests();
