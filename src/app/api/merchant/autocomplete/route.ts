import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { MerchantTrie, createSeededTrie } from '@/lib/algorithms/merchant-trie'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query || query.length < 1) {
      return NextResponse.json([])
    }

    // Try to get trie from Redis
    let trie: MerchantTrie
    try {
      const cachedTrie = await redis.get('merchant:trie')
      if (cachedTrie) {
        trie = MerchantTrie.deserialize(cachedTrie)
      } else {
        // Initialize with seeded data if not found
        trie = createSeededTrie()
        await redis.set('merchant:trie', trie.serialize())
      }
    } catch (error) {
      console.error('Redis error, using fresh trie:', error)
      trie = createSeededTrie()
    }

    const suggestions = trie.search(query, limit)
    
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error in merchant autocomplete:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
