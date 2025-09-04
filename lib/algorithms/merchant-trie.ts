// Trie data structure for fast merchant autocomplete
// Provides O(L) lookup time where L is the length of the search query

export class TrieNode {
  children: Map<string, TrieNode>
  isEndOfWord: boolean
  merchants: Set<string>
  
  constructor() {
    this.children = new Map()
    this.isEndOfWord = false
    this.merchants = new Set()
  }
}

export class MerchantTrie {
  private root: TrieNode
  
  constructor() {
    this.root = new TrieNode()
  }
  
  // Insert a merchant name into the trie
  insert(merchant: string): void {
    let current = this.root
    const normalizedMerchant = merchant.toLowerCase()
    
    for (const char of normalizedMerchant) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode())
      }
      current = current.children.get(char)!
      current.merchants.add(merchant)
    }
    current.isEndOfWord = true
  }
  
  // Search for merchants matching a prefix
  search(prefix: string, limit: number = 10): string[] {
    const normalizedPrefix = prefix.toLowerCase()
    let current = this.root
    
    // Navigate to the prefix node
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return []
      }
      current = current.children.get(char)!
    }
    
    // Return merchants from this node (already contains all merchants with this prefix)
    return Array.from(current.merchants).slice(0, limit)
  }
  
  // Serialize trie to JSON for Redis storage
  serialize(): string {
    return JSON.stringify(this.serializeNode(this.root))
  }
  
  private serializeNode(node: TrieNode): any {
    return {
      children: Object.fromEntries(
        Array.from(node.children.entries()).map(([key, child]) => [
          key,
          this.serializeNode(child)
        ])
      ),
      isEndOfWord: node.isEndOfWord,
      merchants: Array.from(node.merchants)
    }
  }
  
  // Deserialize trie from JSON
  static deserialize(json: string): MerchantTrie {
    const trie = new MerchantTrie()
    const data = JSON.parse(json)
    trie.root = MerchantTrie.deserializeNode(data)
    return trie
  }
  
  private static deserializeNode(data: any): TrieNode {
    const node = new TrieNode()
    node.isEndOfWord = data.isEndOfWord
    node.merchants = new Set(data.merchants)
    
    for (const [key, childData] of Object.entries(data.children)) {
      node.children.set(key, MerchantTrie.deserializeNode(childData))
    }
    
    return node
  }
}

// Common merchant categories and examples for seeding
export const MERCHANT_CATEGORIES = {
  'Restaurants': [
    'McDonald\'s', 'Starbucks', 'Subway', 'Pizza Hut', 'KFC', 'Burger King',
    'Domino\'s Pizza', 'Taco Bell', 'Chipotle', 'Panera Bread'
  ],
  'Grocery': [
    'Walmart', 'Target', 'Kroger', 'Safeway', 'Whole Foods', 'Costco',
    'Sam\'s Club', 'Trader Joe\'s', 'Aldi', 'Publix'
  ],
  'Gas Stations': [
    'Shell', 'Exxon', 'BP', 'Chevron', 'Mobil', 'Texaco',
    '76', 'Arco', 'Citgo', 'Sunoco'
  ],
  'Entertainment': [
    'Netflix', 'Spotify', 'Amazon Prime', 'Disney+', 'Hulu',
    'Apple Music', 'YouTube Premium', 'HBO Max', 'Paramount+'
  ],
  'Transportation': [
    'Uber', 'Lyft', 'Metro', 'Bus Pass', 'Parking Meter',
    'Gas Station', 'Car Wash', 'Auto Repair'
  ]
}

// Initialize trie with common merchants
export function createSeededTrie(): MerchantTrie {
  const trie = new MerchantTrie()
  
  Object.values(MERCHANT_CATEGORIES).flat().forEach(merchant => {
    trie.insert(merchant)
  })
  
  return trie
}
