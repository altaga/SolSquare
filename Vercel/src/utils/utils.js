export function getTimeDifference(startTimestamp, endTimestamp) {
  // Convert timestamps to Date objects
  const startDate = new Date(startTimestamp);
  const endDate = new Date(endTimestamp);

  // Calculate the difference in milliseconds
  const timeDifference = endDate - startDate;

  // Calculate minutes, hours, and days from milliseconds
  const seconds = Math.floor((timeDifference / 1000) % 60);
  const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
  const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return new Date(startTimestamp).toLocaleDateString();
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }
  
  if (seconds > 0) {
    return `${seconds}s`;
  }
}

export const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "40%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export const modalStyleMobile = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  bgcolor: "background.paper",
  border: "2px solid #000",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export function generateRandomString(n) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function completeStringWithSymbol(inputString, symbol, desiredLength) {
  const currentLength = inputString.length;
  if (currentLength >= desiredLength) {
    return inputString;
  }
  const remainingLength = desiredLength - currentLength;
  const symbolsToAdd = symbol.repeat(remainingLength);
  return inputString + symbolsToAdd;
}
