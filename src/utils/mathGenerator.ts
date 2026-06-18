import { MathGate, MathMode, MathDifficulty } from '../types';

/**
 * Helper to get a random integer in [min, max]
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a pair of gates (left and right) based on the level, current soldier count,
 * selected math mode, and the selected math difficulty.
 */
export function generateMathGate(
  id: string,
  y: number,
  level: number,
  currentSoldiers: number,
  mode: MathMode,
  difficulty: MathDifficulty = 'medium'
): MathGate {
  
  // Decide which mathematical operation is active
  let activeMode = mode;
  if (mode === 'mixed') {
    const modes: MathMode[] = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'percentages', 'exponents'];
    // In mixed mode, randomize between operations
    activeMode = modes[Math.floor(Math.random() * modes.length)];
  }

  let textLeft = 'Gate Option';
  let textRight = 'Gate Option';

  let opLeft = '';
  let opRight = '';

  let calcLeft: (curr: number) => number;
  let calcRight: (curr: number) => number;

  // --- ALGEBRAIC / EQUATION MODE ---
  if (mode === 'algebraic') {
    // Equation prompt solved for x. Left and right gates present answers.
    // Easy: x + 2 = 5, Medium: 2x = 10, Hard: 3x - 4 = 11
    let xVal = 4;
    let wrongVal = 6;
    let coeff = 1;
    let constant = 0;
    let equationStr = '';

    if (difficulty === 'easy') {
      xVal = randomBetween(2, 8);
      constant = randomBetween(1, 9);
      equationStr = `Solve: x + ${constant} = ${xVal + constant}`;
      wrongVal = xVal + (Math.random() > 0.5 ? 2 : -2);
      if (wrongVal <= 0) wrongVal = xVal + 3;
    } else if (difficulty === 'medium') {
      xVal = randomBetween(3, 10);
      coeff = randomBetween(2, 4);
      equationStr = `Solve: ${coeff}x = ${coeff * xVal}`;
      wrongVal = xVal + (Math.random() > 0.5 ? 2 : -1);
      if (wrongVal <= 0) wrongVal = xVal + 3;
    } else { // hard
      xVal = randomBetween(4, 12);
      coeff = randomBetween(2, 5);
      constant = randomBetween(1, 10);
      const multiplyPart = coeff * xVal;
      const isAdd = Math.random() > 0.5;
      if (isAdd) {
        equationStr = `Solve: ${coeff}x + ${constant} = ${multiplyPart + constant}`;
      } else {
        equationStr = `Solve: ${coeff}x - ${constant} = ${multiplyPart - constant}`;
      }
      wrongVal = xVal + (Math.random() > 0.5 ? 3 : -2);
      if (wrongVal <= 0) wrongVal = xVal + 4;
    }

    const leftIsCorrect = Math.random() > 0.5;

    textLeft = equationStr;
    textRight = equationStr;

    opLeft = `x = ${leftIsCorrect ? xVal : wrongVal}`;
    opRight = `x = ${leftIsCorrect ? wrongVal : xVal}`;

    // Math power booster rewards for correct algebra
    const rewardMultiplier = difficulty === 'easy' ? 1.5 : difficulty === 'medium' ? 2.0 : 3.0;
    const penaltyAmount = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 6 : 15;

    calcLeft = leftIsCorrect
      ? (curr) => curr + Math.floor(xVal * rewardMultiplier) + 5
      : (curr) => Math.max(1, curr - penaltyAmount);

    calcRight = leftIsCorrect
      ? (curr) => Math.max(1, curr - penaltyAmount)
      : (curr) => curr + Math.floor(xVal * rewardMultiplier) + 5;

    return {
      id,
      y,
      leftGate: { text: textLeft, op: opLeft, val: xVal, calcValue: calcLeft },
      rightGate: { text: textRight, op: opRight, val: wrongVal, calcValue: calcRight },
      triggered: false,
      mode: 'algebraic',
    };
  }

  // --- STANDARD MODE: ADDITION / SUBTRACTION / MULTIPLICATION / DIVISION / NEW SEGMENTS ---
  // We define dynamic bounds depending on DIFFICULTY
  let addMin = 1, addMax = 9;
  let subMin = 1, subMax = 9;
  let multMin = 1, multMax = 5;
  let divMin = 1, divMax = 6;

  if (difficulty === 'easy') {
    addMin = 1; addMax = 10;
    subMin = 1; subMax = 8;
    multMin = 1; multMax = 5;
    divMin = 1; divMax = 5;
  } else if (difficulty === 'medium') {
    addMin = 5; addMax = 25;
    subMin = 3; subMax = 18;
    multMin = 2; multMax = 8;
    divMin = 3; divMax = 11;
  } else { // hard
    addMin = 15; addMax = 80;
    subMin = 8; subMax = 45;
    multMin = 4; multMax = 12;
    divMin = 5; divMax = 22;
  }

  const leftIsPositive = Math.random() > 0.5;

  if (activeMode === 'addition') {
    // 30% chance for triple addition on medium/hard difficulties for more variety!
    const tripleChance = (difficulty !== 'easy') && Math.random() > 0.65;
    if (tripleChance) {
      const a1 = randomBetween(Math.max(1, Math.floor(addMin / 2)), Math.floor(addMax / 3));
      const b1 = randomBetween(Math.max(1, Math.floor(addMin / 2)), Math.floor(addMax / 3));
      const c1 = randomBetween(Math.max(1, Math.floor(addMin / 2)), Math.floor(addMax / 3));
      const valL = a1 + b1 + c1;

      const a2 = randomBetween(1, Math.floor(addMin / 3 + 1));
      const b2 = randomBetween(1, Math.floor(addMin / 3 + 1));
      const c2 = randomBetween(1, Math.floor(addMin / 3 + 1));
      const valR = a2 + b2 + c2;

      const leftVal = leftIsPositive ? valL : valR;
      const rightVal = leftIsPositive ? valR : valL;

      opLeft = leftIsPositive ? `${a1} + ${b1} + ${c1}` : `${a2} + ${b2} + ${c2}`;
      opRight = leftIsPositive ? `${a2} + ${b2} + ${c2}` : `${a1} + ${b1} + ${c1}`;

      calcLeft = (curr) => curr + leftVal;
      calcRight = (curr) => curr + rightVal;
    } else {
      const a1 = randomBetween(addMin, Math.floor(addMax / 2));
      const b1 = randomBetween(addMin, Math.floor(addMax / 2));
      const valL = a1 + b1;

      const a2 = randomBetween(1, Math.floor(addMin + 1));
      const b2 = randomBetween(1, Math.floor(addMin + 2));
      const valR = a2 + b2;

      const leftVal = leftIsPositive ? valL : valR;
      const rightVal = leftIsPositive ? valR : valL;

      opLeft = leftIsPositive ? `${a1} + ${b1}` : `${a2} + ${b2}`;
      opRight = leftIsPositive ? `${a2} + ${b2}` : `${a1} + ${b1}`;

      calcLeft = (curr) => curr + leftVal;
      calcRight = (curr) => curr + rightVal;
    }

  } else if (activeMode === 'subtraction') {
    // Subtracts C troops, display of: a - b
    // Player wants to choose subtraction that loses LESS troops!
    // E.g. "2 - 1" (loses 1) vs "9 - 4" (loses 5)
    // Left Loses less, Right Loses more
    const a1 = randomBetween(Math.max(2, subMin), subMax);
    const b1 = a1 - 1; // evaluated to 1 (loses only 1 troop, very good!)
    const valL = a1 - b1; // evaluates to 1

    const a2 = randomBetween(subMin + 4, subMax + 8);
    const b2 = randomBetween(1, a2 - 4);
    const valR = a2 - b2; // evaluates to larger loss (e.g. 5)

    const leftVal = leftIsPositive ? valL : valR;
    const rightVal = leftIsPositive ? valR : valL;

    opLeft = leftIsPositive ? `${a1} - ${b1}` : `${a2} - ${b2}`;
    opRight = leftIsPositive ? `${a2} - ${b2}` : `${a1} - ${b1}`;

    // Pass subtracts evaluated value from squad
    calcLeft = (curr) => Math.max(1, curr - leftVal);
    calcRight = (curr) => Math.max(1, curr - rightVal);

  } else if (activeMode === 'multiplication') {
    // Adds C troops, display of: a × b
    // E.g. 5x5 (+25) vs 2x2 (+4)
    const a1 = randomBetween(multMin, multMax);
    const b1 = randomBetween(multMin, multMax);
    const valL = a1 * b1;

    const a2 = randomBetween(1, Math.max(2, multMin - 1));
    const b2 = randomBetween(1, Math.max(2, multMin - 1));
    const valR = a2 * b2;

    const leftVal = leftIsPositive ? valL : valR;
    const rightVal = leftIsPositive ? valR : valL;

    opLeft = leftIsPositive ? `${a1} × ${b1}` : `${a2} × ${b2}`;
    opRight = leftIsPositive ? `${a2} × ${b2}` : `${a1} × ${b1}`;

    calcLeft = (curr) => curr + leftVal;
    calcRight = (curr) => curr + rightVal;

  } else if (activeMode === 'division') {
    // Adds C troops, display of: a ÷ b
    // E.g. 12 ÷ 4 (adds 3) vs 4 ÷ 2 (adds 2)
    const b1 = randomBetween(2, Math.max(2, divMin));
    const c1 = randomBetween(2, divMax);
    const a1 = b1 * c1; // always cleanly divisible
    const valL = c1; // evaluations

    const b2 = randomBetween(2, 3);
    const c2 = randomBetween(1, 2);
    const a2 = b2 * c2;
    const valR = c2;

    const leftVal = leftIsPositive ? valL : valR;
    const rightVal = leftIsPositive ? valR : valL;

    opLeft = leftIsPositive ? `${a1} ÷ ${b1}` : `${a2} ÷ ${b2}`;
    opRight = leftIsPositive ? `${a2} ÷ ${b2}` : `${a1} ÷ ${b1}`;

    calcLeft = (curr) => curr + leftVal;
    calcRight = (curr) => curr + rightVal;

  } else if (activeMode === 'fractions') {
    // High option parameters
    let denH = 2, numH = 1, multH = 1;
    if (difficulty === 'easy') {
      denH = Math.random() > 0.5 ? 2 : 4;
      numH = denH === 2 ? 1 : 3;
      multH = randomBetween(6, 12); // e.g. 1/2 of 12 = 6, 3/4 of 16 = 12
    } else if (difficulty === 'medium') {
      denH = [3, 4, 5][Math.floor(Math.random() * 3)];
      numH = denH - 1; // e.g. 2/3, 3/4, 4/5
      multH = randomBetween(12, 24);
    } else { // hard
      denH = [6, 7, 8, 9, 10][Math.floor(Math.random() * 5)];
      numH = denH - randomBetween(1, 2);
      multH = randomBetween(15, 35);
    }
    const valHigh = numH * multH;
    const opHigh = `${numH}/${denH} of ${denH * multH}`;

    // Low option parameters
    let denL = 2, numL = 1, multL = 1;
    if (difficulty === 'easy') {
      denL = 3;
      numL = 1;
      multL = randomBetween(1, 4); // 1/3 of 9 = 3
    } else if (difficulty === 'medium') {
      denL = [3, 4, 5][Math.floor(Math.random() * 3)];
      numL = 1;
      multL = randomBetween(2, 6); // e.g. 1/4 of 16 = 4
    } else { // hard
      denL = [6, 7, 8, 9, 10][Math.floor(Math.random() * 5)];
      numL = randomBetween(1, 2);
      multL = randomBetween(3, 8); // e.g. 2/10 of 40 = 8
    }
    let valLow = numL * multL;
    let opLow = `${numL}/${denL} of ${denL * multL}`;

    // fallback safeguard
    if (valHigh <= valLow) {
      valLow = Math.max(1, valHigh - randomBetween(2, 4));
      opLow = `1/2 of ${valLow * 2}`;
    }

    const leftVal = leftIsPositive ? valHigh : valLow;
    const rightVal = leftIsPositive ? valLow : valHigh;

    opLeft = leftIsPositive ? opHigh : opLow;
    opRight = leftIsPositive ? opLow : opHigh;

    calcLeft = (curr) => curr + leftVal;
    calcRight = (curr) => curr + rightVal;

  } else if (activeMode === 'percentages') {
    // High Option parameters
    let perH = 50, numBaseH = 100;
    if (difficulty === 'easy') {
      perH = [50, 100, 200][Math.floor(Math.random() * 3)];
      numBaseH = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
    } else if (difficulty === 'medium') {
      perH = [25, 40, 60, 75, 150][Math.floor(Math.random() * 5)];
      numBaseH = [40, 60, 80, 100, 120][Math.floor(Math.random() * 5)];
    } else { // hard
      perH = [12, 15, 35, 45, 85, 125][Math.floor(Math.random() * 6)];
      numBaseH = [100, 200, 300, 400][Math.floor(Math.random() * 4)];
    }
    const valHigh = Math.floor((perH * numBaseH) / 100);
    const opHigh = `${perH}% of ${numBaseH}`;

    // Low Option parameters
    let perL = 10, numBaseL = 100;
    if (difficulty === 'easy') {
      perL = [10, 20, 25][Math.floor(Math.random() * 3)];
      numBaseL = [10, 20, 30][Math.floor(Math.random() * 3)];
    } else if (difficulty === 'medium') {
      perL = [5, 10, 15, 20][Math.floor(Math.random() * 4)];
      numBaseL = [20, 30, 40, 50][Math.floor(Math.random() * 4)];
    } else { // hard
      perL = [4, 8, 12, 18][Math.floor(Math.random() * 4)];
      numBaseL = [50, 100, 150][Math.floor(Math.random() * 3)];
    }
    let valLow = Math.floor((perL * numBaseL) / 100);
    let opLow = `${perL}% of ${numBaseL}`;

    // fallback safeguard
    if (valHigh <= valLow) {
      valLow = Math.max(1, valHigh - randomBetween(1, 3));
      opLow = `50% of ${valLow * 2}`;
    }

    const leftVal = leftIsPositive ? valHigh : valLow;
    const rightVal = leftIsPositive ? valLow : valHigh;

    opLeft = leftIsPositive ? opHigh : opLow;
    opRight = leftIsPositive ? opLow : opHigh;

    calcLeft = (curr) => curr + leftVal;
    calcRight = (curr) => curr + rightVal;

  } else { // activeMode === 'exponents'
    let valHigh = 0;
    let opHigh = '';
    let valLow = 0;
    let opLow = '';

    const isExpH = Math.random() > 0.5;
    if (difficulty === 'easy') {
      if (isExpH) {
        const base = randomBetween(2, 4);
        valHigh = base * base;
        opHigh = `${base}²`;
      } else {
        const rootVal = randomBetween(4, 9);
        valHigh = rootVal;
        opHigh = `√${rootVal * rootVal}`;
      }

      const isExpL = Math.random() > 0.5;
      if (isExpL) {
        valLow = randomBetween(1, 3);
        opLow = `${valLow}¹`;
      } else {
        const rootVal = randomBetween(1, 3);
        valLow = rootVal;
        opLow = `√${rootVal * rootVal}`;
      }
    } else if (difficulty === 'medium') {
      if (isExpH) {
        const isCube = Math.random() > 0.5;
        if (isCube) {
          const base = randomBetween(2, 4); // 2^3=8, 3^3=27, 4^3=64
          valHigh = base * base * base;
          opHigh = `${base}³`;
        } else {
          const base = randomBetween(5, 9); // 5^2=25, ..., 9^2=81
          valHigh = base * base;
          opHigh = `${base}²`;
        }
      } else {
        const rootVal = randomBetween(8, 12); // √64=8, ..., √144=12
        valHigh = rootVal;
        opHigh = `√${rootVal * rootVal}`;
      }

      const isExpL = Math.random() > 0.5;
      if (isExpL) {
        const base = randomBetween(2, 3);
        valLow = base * base;
        opLow = `${base}²`;
      } else {
        const rootVal = randomBetween(2, 4);
        valLow = rootVal;
        opLow = `√${rootVal * rootVal}`;
      }
    } else { // hard
      if (isExpH) {
        const choice = randomBetween(1, 3);
        if (choice === 1) {
          const base = randomBetween(2, 3); // 2^5 = 32, 3^4 = 81
          const exp = base === 2 ? 5 : 4;
          valHigh = Math.pow(base, exp);
          opHigh = `${base}^${exp}`;
        } else if (choice === 2) {
          const base = randomBetween(6, 12);
          valHigh = base * base;
          opHigh = `${base}²`;
        } else {
          const base = randomBetween(4, 6);
          valHigh = base * base * base;
          opHigh = `${base}³`;
        }
      } else {
        const rootVal = randomBetween(13, 20); // √169..√400
        valHigh = rootVal;
        opHigh = `√${rootVal * rootVal}`;
      }

      const choiceL = Math.random() > 0.5;
      if (choiceL) {
        const base = randomBetween(3, 5);
        valLow = base * base;
        opLow = `${base}²`;
      } else {
        const rootVal = randomBetween(5, 8);
        valLow = rootVal;
        opLow = `√${rootVal * rootVal}`;
      }
    }

    if (valHigh <= valLow) {
      valHigh = valLow + 5;
      opHigh = `√${valHigh * valHigh}`;
    }

    const leftVal = leftIsPositive ? valHigh : valLow;
    const rightVal = leftIsPositive ? valLow : valHigh;

    opLeft = leftIsPositive ? opHigh : opLow;
    opRight = leftIsPositive ? opLow : opHigh;

    calcLeft = (curr) => curr + leftVal;
    calcRight = (curr) => curr + rightVal;
  }

  // Label text matching
  textLeft = "Matrix Code";
  textRight = "Matrix Code";

  return {
    id,
    y,
    leftGate: {
      text: textLeft,
      op: opLeft,
      val: 0,
      calcValue: calcLeft,
    },
    rightGate: {
      text: textRight,
      op: opRight,
      val: 0,
      calcValue: calcRight,
    },
    triggered: false,
    mode: activeMode,
  };
}
