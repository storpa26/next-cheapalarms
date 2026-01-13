"use client";

import { paradoxProducts } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

const RemotesStep = () => {
  const remotes = paradoxProducts.filter(p => p.category === 'remote');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Add Remotes (Optional)
        </h2>
        <p className="text-muted-foreground">
          Control your system from your pocket or keychain. Handy for quick arming on the way out.
        </p>
        <Link 
          href="/paradox-magellan/compare/remotes" 
          target="_blank"
          className="inline-flex items-center gap-1 text-secondary hover:underline text-sm mt-2"
        >
          Compare remotes <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {remotes.map((remote) => (
          <ProductCard 
            key={remote.id}
            product={remote}
            recommended={remote.id === 'rem25'}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Tip: The 2-way remote (REM25) confirms your commands worked – no more second-guessing.
      </p>
    </div>
  );
};

export default RemotesStep;
