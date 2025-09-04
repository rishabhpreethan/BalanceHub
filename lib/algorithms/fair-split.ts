// Graph-based debt minimization algorithm
// Minimizes the number of transactions needed to settle all debts

export interface DebtEdge {
  from: string
  to: string
  amount: number
}

export interface UserBalance {
  userId: string
  name: string
  balance: number // positive = owed money, negative = owes money
}

export interface Settlement {
  from: string
  to: string
  amount: number
  fromName: string
  toName: string
}

export function calculateFairSplit(balances: UserBalance[]): Settlement[] {
  // Create arrays for creditors (positive balance) and debtors (negative balance)
  const creditors = balances.filter(b => b.balance > 0).map(b => ({ ...b }))
  const debtors = balances.filter(b => b.balance < 0).map(b => ({ ...b, balance: Math.abs(b.balance) }))
  
  const settlements: Settlement[] = []
  
  // Greedy algorithm to minimize transactions
  let creditorIndex = 0
  let debtorIndex = 0
  
  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex]
    const debtor = debtors[debtorIndex]
    
    // Calculate settlement amount (minimum of what creditor is owed and what debtor owes)
    const settlementAmount = Math.min(creditor.balance, debtor.balance)
    
    // Create settlement
    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: settlementAmount,
      fromName: debtor.name,
      toName: creditor.name
    })
    
    // Update balances
    creditor.balance -= settlementAmount
    debtor.balance -= settlementAmount
    
    // Move to next creditor/debtor if current one is settled
    if (creditor.balance === 0) creditorIndex++
    if (debtor.balance === 0) debtorIndex++
  }
  
  return settlements
}

// Calculate group balances from expense events
export function calculateGroupBalances(expenses: Array<{
  userId: string
  userName: string
  amount: number
}>, groupSize: number): UserBalance[] {
  const userTotals = new Map<string, { name: string, spent: number }>()
  let totalExpenses = 0
  
  // Calculate total spent by each user
  expenses.forEach(expense => {
    const current = userTotals.get(expense.userId) || { name: expense.userName, spent: 0 }
    current.spent += expense.amount
    userTotals.set(expense.userId, current)
    totalExpenses += expense.amount
  })
  
  // Calculate fair share per person
  const fairShare = totalExpenses / groupSize
  
  // Calculate balances (positive = owed money, negative = owes money)
  const balances: UserBalance[] = []
  userTotals.forEach((data, userId) => {
    balances.push({
      userId,
      name: data.name,
      balance: data.spent - fairShare
    })
  })
  
  return balances
}
