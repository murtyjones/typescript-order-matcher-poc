[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fmurtyjones%2Ftypescript-order-matcher-poc%2Fmain)](https://dashboard.stryker-mutator.io/reports/github.com/murtyjones/typescript-order-matcher-poc/main)

# TypeScript Order Matcher Proof-of-Concept

## What is this repository???

This repository implements a proof-of-concept order matching engine in TypeScript.

This is an educational project, and TypeScript was chosen for ease of reading and ease of writing. In reality, you wouldn't use such a high-level language to implement order matching, because the performance and control of a lower-level language (e.g. Rust, C/C++) is much better suited to this purpose. Don't try and use this project for a real order matching engine, but do try and learn from this project before implementing your own.

## Okay, so what's an order matching engine?

Order matching is the process of connecting those who want to buy an asset with those looking to sell it.

There are two types of orders that a person can place using this order matcher:

- **Limit**: This is an offer to buy a stock at a given price (or below), or an offer to sell a stock at a given price (or above)
- **Market**: This is an offer to buy an asset at the cheapest sale price currently offered, or to sell a stock at the highest bid on offer

The order matching engine executes at the best price for the buyer. That is to say, we'll always take the lowest offer available from a seller that is equal to or less than what the buyer is willing to pay.

When an order comes into the matching engine, it will attempt to execute as much of the order as possible, and will save the rest of the order, if any, for when it can be filled.

## Trade Examples

- A limit offer to sell 1 share at $1.30 or higher, matched with an offer to buy 1 unit at $1.35, will execute for **1 share** at **\$1.30** per share
- A limit offer to sell 1 share at $1.40 or higher, matched with an offer to buy 1 unit at market price, will execute for **1 share** at $1.40
- Two market orders matched with each other will not execute, and will be instead be saved in the order book until limit orders become available. Since market orders don't express a price preference, they can't be matched for a deal and must both have a counterparty willing to offer a price. In practice this would be extremely rare on an exchange as it would mean that zero liquidity is on offer
- A market order to buy 100 shares, matched with an offer to sell 23 units at $1.30 and 17 units at $1.31, will _partially_ execute, for **23 @ \$1.30** and **17 @ \$1.31**, and will leave the remaining 60 shares in the order book to be executed whenever possible

## How might this repository be improved in the future?

- Adding the ability to cancel orders
- All-or-none (IE fill the entire order, or fill none of it)
- Dealing with allocation in the case of conflicting orders (e.g. two separate offer to sell 1 share at $1.30, and one offer comes in to buy 1 share at $1.30; which sell order is allocated the trade?) by implementing either **first-in-first-out** or **pro-rata**
- A more efficient matching algorithm (although this is of limited use in TypeScript as optimizations aren't likely to be all that effective)
