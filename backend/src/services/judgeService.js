const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const Submission = require('../models/Submission');
const Problem = require('../models/Problem');
const User = require('../models/User');
const aiJudgeService = require('./aiJudgeService');

// Language configurations
const LANGUAGE_CONFIG = {
  python: {
    extension: 'py',
    compileCmd: null,
    runCmd: (filename) => {
      if (process.platform === 'win32') {
        return `py "${filename}"`;
      }
      return `python3 "${filename}"`;
    }
  },
  javascript: {
    extension: 'js',
    compileCmd: null,
    runCmd: (filename) => `node "${filename}"`
  },
  cpp: {
    extension: 'cpp',
    compileCmd: (filename) => `g++ "${filename}" -o "${filename}.out"`,
    runCmd: (filename) => {
      if (process.platform === 'win32') {
        return `"${filename}.exe"`;
      }
      return `"${filename}.out"`;
    }
  },
  java: {
    extension: 'java',
    compileCmd: (filename) => `javac "${filename}"`,
    runCmd: (filename) => {
      const className = path.basename(filename, '.java');
      return `java -cp "${path.dirname(filename)}" ${className}`;
    }
  }
};

class JudgeService {
  async judgeSubmission(submissionId, problem, testCases, code, language) {
    try {
      console.log(`🔍 Judging submission ${submissionId}...`);
      
      await Submission.findByIdAndUpdate(submissionId, { 
        status: 'judging' 
      });

      // Check if AI Judge is enabled
      const useAI = process.env.USE_AI_JUDGE === 'true';
      const aiInitialized = await aiJudgeService.isInitialized();

      if (useAI && aiInitialized) {
        console.log('🤖 Using Gemini AI Judge...');
        try {
          return await this.judgeWithAI(submissionId, problem, testCases, code, language);
        } catch (aiError) {
          console.error('❌ AI Judge failed, falling back to traditional:', aiError);
          return await this.judgeTraditional(submissionId, problem, testCases, code, language);
        }
      } else {
        console.log('🔧 Using Traditional Judge...');
        return await this.judgeTraditional(submissionId, problem, testCases, code, language);
      }

    } catch (error) {
      console.error('❌ Judge error:', error);
      await this.updateSubmissionError(submissionId, 'Internal judge error');
    }
  }

  async judgeWithAI(submissionId, problem, testCases, code, language) {
    try {
      const result = await aiJudgeService.judgeCode(problem, code, language, testCases);

      console.log('🤖 AI Verdict:', result.status);
      console.log('📊 Test Cases Passed:', `${result.testCasesPassed}/${result.totalTestCases}`);

      await Submission.findByIdAndUpdate(submissionId, {
        status: result.status,
        testCasesPassed: result.testCasesPassed,
        totalTestCases: result.totalTestCases,
        executionTime: result.executionTime,
        errorMessage: result.status !== 'accepted' ? result.feedback : null,
        aiAnalysis: result.aiAnalysis,
        memory: 0
      });

      if (result.status === 'accepted') {
        await Problem.findByIdAndUpdate(problem._id, {
          $inc: { acceptedCount: 1, submissionCount: 1 }
        });

        const submission = await Submission.findById(submissionId);
        await User.findByIdAndUpdate(submission.userId, {
          $inc: { solvedProblems: 1 }
        });
      } else {
        await Problem.findByIdAndUpdate(problem._id, {
          $inc: { submissionCount: 1 }
        });
      }

      return result;

    } catch (error) {
      throw error;
    }
  }

  async judgeTraditional(submissionId, problem, testCases, code, language) {
    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      await this.updateSubmissionError(submissionId, 'Unsupported language');
      return;
    }

    const tempDir = path.join(__dirname, '../../temp', submissionId.toString());
    await fs.mkdir(tempDir, { recursive: true });

    const filename = path.join(tempDir, `solution.${langConfig.extension}`);
    await fs.writeFile(filename, code);

    if (langConfig.compileCmd) {
      const compileResult = await this.executeCommand(
        langConfig.compileCmd(filename),
        tempDir,
        5000
      );

      if (compileResult.error) {
        await this.updateSubmissionError(
          submissionId, 
          compileResult.stderr || 'Compilation error',
          'compile_error'
        );
        await this.cleanup(tempDir);
        return;
      }
    }

    let passedTests = 0;
    let totalTime = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      const result = await this.runTestCase(
        langConfig.runCmd(filename),
        tempDir,
        testCase.input,
        testCase.expectedOutput,
        problem.timeLimit,
        problem.memoryLimit
      );

      if (result.status === 'passed') {
        passedTests++;
        totalTime += result.time;
      } else {
        await this.updateSubmissionError(
          submissionId,
          result.status === 'time_limit' ? 'Time Limit Exceeded' :
          result.status === 'runtime_error' ? result.error :
          'Wrong Answer',
          result.status,
          passedTests,
          testCases.length
        );
        await this.cleanup(tempDir);
        return;
      }
    }

    await Submission.findByIdAndUpdate(submissionId, {
      status: 'accepted',
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      executionTime: totalTime,
      memory: 0
    });

    await Problem.findByIdAndUpdate(problem._id, {
      $inc: { acceptedCount: 1, submissionCount: 1 }
    });

    const submission = await Submission.findById(submissionId);
    await User.findByIdAndUpdate(submission.userId, {
      $inc: { solvedProblems: 1 }
    });

    await this.cleanup(tempDir);
  }

  async runTestCase(runCmd, cwd, input, expectedOutput, timeLimit, memoryLimit) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const child = exec(runCmd, {
        cwd,
        timeout: timeLimit,
        maxBuffer: memoryLimit * 1024 * 1024
      }, (error, stdout, stderr) => {
        const executionTime = Date.now() - startTime;

        if (error) {
          if (error.killed || error.signal === 'SIGTERM') {
            return resolve({ status: 'time_limit', time: executionTime });
          }
          return resolve({ 
            status: 'runtime_error', 
            error: stderr || error.message,
            time: executionTime
          });
        }

        const actualOutput = stdout.trim();
        const expected = expectedOutput.trim();

        if (actualOutput === expected) {
          return resolve({ 
            status: 'passed', 
            time: executionTime,
            memory: 0
          });
        } else {
          return resolve({ 
            status: 'wrong_answer',
            time: executionTime
          });
        }
      });

      if (input) {
        child.stdin.write(input + '\n');
        child.stdin.end();
      }
    });
  }

  async executeCommand(cmd, cwd, timeout) {
    return new Promise((resolve) => {
      exec(cmd, { cwd, timeout }, (error, stdout, stderr) => {
        resolve({ error, stdout, stderr });
      });
    });
  }

  async updateSubmissionError(submissionId, errorMessage, status = 'runtime_error', passed = 0, total = 0) {
    await Submission.findByIdAndUpdate(submissionId, {
      status,
      errorMessage,
      testCasesPassed: passed,
      totalTestCases: total
    });

    const submission = await Submission.findById(submissionId);
    await Problem.findByIdAndUpdate(submission.problemId, {
      $inc: { submissionCount: 1 }
    });
  }

  async cleanup(tempDir) {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

module.exports = new JudgeService();