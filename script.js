let currentValue = "0";
let previousValue = "0";
let formula = "";
let calculated = false;

const endsWithOperator = /[x+-/]$/;

function onStateChanged() {
  document.querySelector("#display").textContent = currentValue;
  document.querySelector("#formula-screen").textContent = formula;
}

function setCurrentValue(value) {
  currentValue = value;
  onStateChanged();
}

function setPreviousValue(value) {
  previousValue = value;
  onStateChanged();
}

function setCalculated(value) {
  calculated = value;
  onStateChanged();
}

function setFormula(value) {
  formula = value;
  onStateChanged();
}

function clear() {
  setCurrentValue("0");
  setPreviousValue("0");
  setFormula("");
  setCalculated(false);
}

function operate() {
  let expression = formula;
  while (endsWithOperator.test(expression)) {
    expression = expression.slice(0, -1);
  }

  expression = expression
    .replace(/x/g, "*")
    .replace(/-/g, "-")
    .replace("--", "+0+0+0+0+0+0+");
  const result = Math.round(1e12 * eval(expression)) / 1e12;

  setCurrentValue(result.toString());
  setFormula(
    expression
      .replace(/\*/g, "⋅")
      .replace(/-/g, "-")
      .replace("+0+0+0+0+0+0+", "--")
      .replace(/(x|\/|\+)-/, "$1-")
      .replace(/^-/, "-") +
      "=" +
      result
  );
  setPreviousValue(result);
  setCalculated(true);
}

function handleNumbers(e) {
  const number = e.value;
  if (calculated) {
    setCurrentValue(number);
    setFormula(number !== "0" ? number : "");
  } else {
    if (currentValue === "0" && number === "0") {
      if (!formula) {
        setFormula(number);
      }
    } else {
      if (/([^.0-9]0|^0)$/.test(formula)) {
        setFormula(formula.slice(0, -1) + number);
      } else {
        setFormula(formula + number);
      }
    }

    const isOperator = /[x+\-/]/;
    if (currentValue === "0" || isOperator.test(currentValue)) {
      setCurrentValue(number);
    } else {
      setCurrentValue(currentValue + number);
    }
  }

  setCalculated(false);
}

function handleDecimal() {
  if (calculated) {
    setCurrentValue("0.");
    setFormula("0.");
  } else if (!currentValue.includes(".")) {
    if (
      endsWithOperator.test(formula) ||
      (currentValue === "0" && formula === "")
    ) {
      setCurrentValue("0.");
      setFormula(formula + "0.");
    } else {
      setCurrentValue(formula.match(/(\-?\d+\.?\d*)$/)[0] + ".");
      setFormula(formula + ".");
    }
  }

  setCalculated(false);
}

function handleOperator(e) {
  const operator = e.value;
  const endsWithNegativeSign = /\d[x/+\-]{1}-$/;

  if (calculated) {
    setFormula(previousValue + operator);
  } else {
    if (endsWithOperator.test(formula)) {
      if (endsWithNegativeSign.test(formula)) {
        if (operator !== "-") {
          setFormula(previousValue + operator);
        }
      } else {
        if (endsWithNegativeSign.test(formula + operator)) {
          setFormula(formula + operator);
        } else {
          setFormula(previousValue + operator);
        }
      }
    } else {
      setPreviousValue(formula);
      setFormula(formula + operator);
    }
  }

  setCurrentValue(operator);
  setCalculated(false);
}

document.querySelector("#clear").addEventListener("click", clear);
document.querySelector("#equals").addEventListener("click", operate);
document.querySelector("#decimal").addEventListener("click", handleDecimal);

const btnNumbers = document.querySelectorAll(".number");

btnNumbers.forEach((btnNumber) => {
  btnNumber.addEventListener("click", () => {
    handleNumbers(btnNumber);
  });
});

const btnOperators = document.querySelectorAll(".operator");

btnOperators.forEach((btnOperator) => {
  btnOperator.addEventListener("click", () => {
    handleOperator(btnOperator);
  });
});
