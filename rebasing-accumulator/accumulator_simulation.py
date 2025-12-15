
import numpy as np
import matplotlib.pyplot as plt
import pandas as pd

print("=" * 70)
print("SPT V7.0 BASE CASE SIMULATION")
print("Direct Token Holding (No Leverage)")
print("=" * 70)

# ===== PARAMETERS =====
k = 0.008  # Daily sensitivity (Degen Mode)
days = 365
annual_yield = 0.10  # 10% APR rebasing
initial_capital = 10000  # User's capital
initial_token_price = 100  # SPT price at start

print(f"\nParameters:")
print(f"  Initial Investment: ${initial_capital:,}")
print(f"  Initial Token Price: ${initial_token_price}")
print(f"  Sensitivity (k): {k} daily (~600% theoretical APR)")
print(f"  Rebase Yield: {annual_yield*100:.0f}% APR")
print(f"  Holding Period: {days} days")

# Calculate tokens bought
initial_tokens = initial_capital / initial_token_price
print(f"  Tokens Purchased: {initial_tokens:.2f} SPT")

# ===== SCENARIOS (Constant Daily Deviation) =====
scenarios = {
    'Big Winner': {'delta': 0.20, 'desc': '+20% above benchmark daily'},
    'Small Winner': {'delta': 0.02, 'desc': '+2% above benchmark daily'},
    'Neutral': {'delta': 0.0, 'desc': 'Tracks benchmark perfectly'},
    'Small Loser': {'delta': -0.02, 'desc': '-2% below benchmark daily'},
    'Big Loser': {'delta': -0.20, 'desc': '-20% below benchmark daily'}
}

# Calculate daily factors
daily_yield_factor = (1 + annual_yield) ** (1/365)

print("\n" + "=" * 70)
print("1-YEAR OUTCOMES (Direct Holding)")
print("=" * 70)

results = {}
time = np.arange(days + 1)

for name, config in scenarios.items():
    delta = config['delta']
    daily_price_factor = np.exp(k * delta)
    
    # Calculate paths
    price_path = [initial_token_price]
    balance_path = [initial_tokens]
    value_path = [initial_capital]
    
    for day in range(days):
        price_path.append(price_path[-1] * daily_price_factor)
        balance_path.append(balance_path[-1] * daily_yield_factor)
        value_path.append(price_path[-1] * balance_path[-1])
    
    # Final values
    final_price = price_path[-1]
    final_balance = balance_path[-1]
    final_value = value_path[-1]
    
    results[name] = {
        'delta': delta,
        'desc': config['desc'],
        'price_mult': final_price / initial_token_price,
        'balance_mult': final_balance / initial_tokens,
        'total_mult': final_value / initial_capital,
        'final_price': final_price,
        'final_balance': final_balance,
        'final_value': final_value,
        'price_path': price_path,
        'balance_path': balance_path,
        'value_path': value_path
    }
    
    print(f"\n{name} ({config['desc']}):")
    print(f"  Final Price:   ${final_price:,.2f} ({final_price/initial_token_price:.3f}x)")
    print(f"  Final Balance: {final_balance:.2f} tokens ({final_balance/initial_tokens:.3f}x)")
    print(f"  Final Value:   ${final_value:,.2f} ({final_value/initial_capital:.3f}x)")
    print(f"  Total Return:  {(final_value/initial_capital - 1)*100:+.1f}%")

# ===== SUMMARY TABLE =====
print("\n" + "=" * 70)
print("SUMMARY TABLE")
print("=" * 70)

summary_data = []
for name, data in results.items():
    summary_data.append({
        'Scenario': name,
        'Daily Δ': f"{data['delta']:+.2f}",
        'Price': f"{data['price_mult']:.3f}x",
        'Balance': f"{data['balance_mult']:.3f}x",
        'Total': f"{data['total_mult']:.3f}x",
        'Final Value': f"${data['final_value']:,.0f}",
        'Return': f"{(data['total_mult']-1)*100:+.1f}%"
    })

df = pd.DataFrame(summary_data)
print("\n" + df.to_string(index=False))

# Save CSV
df.to_csv('spt_base_case_results.csv', index=False)
print("\n📊 Results saved to: spt_base_case_results.csv")

# ===== PLOTTING =====
fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('SPT V7.0 Base Case: Direct Token Holding (No Leverage)', 
             fontsize=16, fontweight='bold')

colors = {
    'Big Winner': 'green',
    'Small Winner': 'lightgreen',
    'Neutral': 'gray',
    'Small Loser': 'orange',
    'Big Loser': 'red'
}

# Chart 1: Price Evolution
ax1 = axes[0, 0]
for name, data in results.items():
    ax1.plot(time, data['price_path'], label=name, linewidth=2, color=colors[name])
ax1.set_yscale('log')
ax1.axhline(y=initial_token_price, color='black', linestyle=':', alpha=0.5)
ax1.set_title('Token Price (Pure Revenue Signal)', fontweight='bold', fontsize=12)
ax1.set_ylabel('Price per Token ($) [Log Scale]')
ax1.set_xlabel('Days')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Chart 2: Balance Evolution (Rebasing)
ax2 = axes[0, 1]
for name, data in results.items():
    ax2.plot(time, data['balance_path'], label=name, linewidth=2, color=colors[name])
ax2.axhline(y=initial_tokens, color='black', linestyle=':', alpha=0.5)
ax2.set_title('Token Balance (10% APR Rebasing)', fontweight='bold', fontsize=12)
ax2.set_ylabel('Token Balance')
ax2.set_xlabel('Days')
ax2.legend()
ax2.grid(True, alpha=0.3)

# Chart 3: Total Value
ax3 = axes[1, 0]
for name, data in results.items():
    ax3.plot(time, data['value_path'], label=name, linewidth=3, color=colors[name])
ax3.set_yscale('log')
ax3.axhline(y=initial_capital, color='black', linestyle=':', alpha=0.5, label='Initial $10k')
ax3.set_title('Total Value (Price × Balance)', fontweight='bold', fontsize=12)
ax3.set_ylabel('Total Value ($) [Log Scale]')
ax3.set_xlabel('Days')
ax3.legend()
ax3.grid(True, alpha=0.3)

# Chart 4: Final Values Bar Chart
ax4 = axes[1, 1]
names = list(results.keys())
final_values = [results[n]['final_value'] for n in names]
bar_colors = [colors[n] for n in names]
bars = ax4.bar(range(len(names)), final_values, color=bar_colors, alpha=0.7, edgecolor='black')
ax4.axhline(y=initial_capital, color='black', linestyle='--', alpha=0.5, label='Initial $10k')
ax4.set_title('Final Values After 1 Year', fontweight='bold', fontsize=12)
ax4.set_ylabel('Final Value ($)')
ax4.set_xticks(range(len(names)))
ax4.set_xticklabels(names, rotation=15, ha='right')
ax4.legend()
ax4.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
for i, (bar, val) in enumerate(zip(bars, final_values)):
    ax4.text(i, val, f'${val:,.0f}', ha='center', va='bottom', fontsize=9, fontweight='bold')

plt.tight_layout()
plt.savefig('spt_base_case_simulation.png', dpi=150, bbox_inches='tight')
print("📈 Chart saved to: spt_base_case_simulation.png")

print("\n" + "=" * 70)
print("KEY INSIGHTS:")
print("=" * 70)
print("1. Price tracks revenue dominance (exponential)")
print("2. Balance grows from vault yield (10% APR)")
print("3. Total value = Price × Balance (multiplicative)")
print("4. Even losers retain some value due to yield cushion")
print("5. No leverage = No liquidation risk")
print("=" * 70)
