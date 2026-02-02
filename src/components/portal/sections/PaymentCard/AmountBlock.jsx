/**
 * Amount selection block: preset buttons (Minimum, 25%, 50%, 75%, Full), custom amount toggle/input, selected amount display.
 * Receives all state and handlers from PaymentCard; no internal payment logic.
 */
function AmountBlock({
  formatAmount,
  useCustomAmount,
  setUseCustomAmount,
  customAmount,
  setCustomAmount,
  selectedPreset,
  setSelectedPreset,
  handlePresetClick,
  handleCustomAmountToggle,
  minimumPayment,
  remainingBalance,
  invoiceTotal,
  preset25,
  preset50,
  preset75,
  preset25Valid,
  preset50Valid,
  preset75Valid,
  requiresFullPayment,
  payableAmount,
  customAmountError,
}) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 shadow-xl p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-bold mb-4">Payment Amount</p>

      {!useCustomAmount && (
        <div className="mt-4 space-y-3">
          {requiresFullPayment ? (
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-semibold text-primary mb-3 text-center">
                Final Payment Required - Full Amount
              </p>
              {remainingBalance !== null && remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => handlePresetClick("full")}
                  aria-label={`Pay full remaining amount of ${formatAmount(remainingBalance)}`}
                  aria-pressed={selectedPreset === "full"}
                  className="w-full relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-base font-bold">Pay Full Amount</span>
                    <span className="text-xs opacity-90">{formatAmount(remainingBalance)}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {minimumPayment !== null && minimumPayment > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePresetClick("minimum")}
                    aria-label={`Pay minimum amount of ${formatAmount(minimumPayment)}`}
                    aria-pressed={selectedPreset === "minimum"}
                    className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                      selectedPreset === "minimum"
                        ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                        : "bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">Minimum</span>
                      <span
                        className={`text-xs ${selectedPreset === "minimum" ? "opacity-90" : "text-muted-foreground"}`}
                      >
                        {formatAmount(minimumPayment)}
                      </span>
                    </div>
                    {selectedPreset === "minimum" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    )}
                  </button>
                )}
                {preset25Valid && preset25 !== null && (
                  <button
                    type="button"
                    onClick={() => handlePresetClick("25")}
                    aria-label={`Pay 25% which is ${formatAmount(preset25)}`}
                    aria-pressed={selectedPreset === "25"}
                    className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                      selectedPreset === "25"
                        ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                        : "bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">25%</span>
                      <span
                        className={`text-xs ${selectedPreset === "25" ? "opacity-90" : "text-muted-foreground"}`}
                      >
                        {formatAmount(preset25)}
                      </span>
                    </div>
                    {selectedPreset === "25" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    )}
                  </button>
                )}
                {preset50Valid && preset50 !== null && (
                  <button
                    type="button"
                    onClick={() => handlePresetClick("50")}
                    aria-label={`Pay 50% which is ${formatAmount(preset50)}`}
                    aria-pressed={selectedPreset === "50"}
                    className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                      selectedPreset === "50"
                        ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                        : "bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">50%</span>
                      <span
                        className={`text-xs ${selectedPreset === "50" ? "opacity-90" : "text-muted-foreground"}`}
                      >
                        {formatAmount(preset50)}
                      </span>
                    </div>
                    {selectedPreset === "50" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    )}
                  </button>
                )}
                {preset75Valid && preset75 !== null && (
                  <button
                    type="button"
                    onClick={() => handlePresetClick("75")}
                    aria-label={`Pay 75% which is ${formatAmount(preset75)}`}
                    aria-pressed={selectedPreset === "75"}
                    className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                      selectedPreset === "75"
                        ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                        : "bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">75%</span>
                      <span
                        className={`text-xs ${selectedPreset === "75" ? "opacity-90" : "text-muted-foreground"}`}
                      >
                        {formatAmount(preset75)}
                      </span>
                    </div>
                    {selectedPreset === "75" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    )}
                  </button>
                )}
                {remainingBalance !== null && remainingBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePresetClick("full")}
                    aria-label={`Pay full amount of ${formatAmount(remainingBalance)}`}
                    aria-pressed={selectedPreset === "full"}
                    className={`relative overflow-hidden rounded-xl px-4 py-4 text-sm font-semibold transition-all duration-200 ${
                      selectedPreset === "full"
                        ? "bg-gradient-to-br from-primary via-primary to-primary/90 text-white shadow-xl shadow-primary/30 scale-[1.02] ring-2 ring-primary/50"
                        : "bg-white/80 backdrop-blur-sm border border-border/60 text-foreground hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base font-bold">Full</span>
                      <span
                        className={`text-xs ${selectedPreset === "full" ? "opacity-90" : "text-muted-foreground"}`}
                      >
                        {formatAmount(remainingBalance)}
                      </span>
                    </div>
                    {selectedPreset === "full" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
                    )}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleCustomAmountToggle}
                aria-label="Enter custom payment amount"
                className="w-full rounded-xl border-2 border-dashed border-border/60 bg-white/50 backdrop-blur-sm px-4 py-3.5 text-sm font-semibold text-foreground transition-all duration-200 hover:border-primary/60 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Pay custom amount</span>
                  <span className="text-xs text-muted-foreground">→</span>
                </div>
              </button>
            </>
          )}

          {((selectedPreset || (!useCustomAmount && payableAmount !== null)) &&
            payableAmount !== null &&
            payableAmount > 0) && (
            <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 ring-1 ring-primary/20 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
              <div className="relative text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/70 mb-2">
                  {selectedPreset ? "Selected Amount" : "Amount to Pay"}
                </p>
                <p className="text-5xl font-black bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {formatAmount(payableAmount)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {useCustomAmount && !requiresFullPayment && (
        <div className="mt-4 space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border-2 border-primary/30 shadow-inner backdrop-blur-sm">
              <span className="text-2xl font-bold text-primary">$</span>
              <input
                type="number"
                id="custom-amount-input"
                min={minimumPayment !== null ? minimumPayment.toFixed(2) : "0.01"}
                max={remainingBalance !== null ? remainingBalance : invoiceTotal || undefined}
                step="0.01"
                value={customAmount ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setCustomAmount(isNaN(val) ? null : val);
                }}
                aria-label="Custom payment amount"
                aria-describedby="custom-amount-help custom-amount-error"
                aria-invalid={customAmountError !== null}
                aria-required="true"
                className="flex-1 text-4xl font-black text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/30"
                placeholder={minimumPayment !== null ? minimumPayment.toFixed(2) : "0.00"}
                autoFocus
              />
            </div>
          </div>

          {customAmountError && (
            <div className="rounded-xl bg-error/10 border border-error/30 p-3 animate-in fade-in">
              <p id="custom-amount-error" className="text-xs text-error font-semibold" role="alert">
                ⚠️ {customAmountError}
              </p>
            </div>
          )}

          {minimumPayment !== null && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs backdrop-blur-sm">
              <span className="text-muted-foreground">
                Minimum: <span className="font-semibold text-foreground">{formatAmount(minimumPayment)}</span>
              </span>
              <span className="text-muted-foreground">
                Max:{" "}
                <span className="font-semibold text-foreground">
                  {formatAmount(remainingBalance ?? invoiceTotal ?? 0)}
                </span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setUseCustomAmount(false);
                setCustomAmount(null);
                setSelectedPreset(null);
              }}
              className="text-sm text-muted-foreground hover:text-foreground font-medium underline transition-colors"
            >
              ← Use presets
            </button>
            {remainingBalance !== null && remainingBalance > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <button
                  type="button"
                  onClick={() => setCustomAmount(remainingBalance)}
                  className="text-sm text-primary hover:underline font-semibold transition-colors"
                >
                  Pay full amount ({formatAmount(remainingBalance)})
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

AmountBlock.displayName = "AmountBlock";

export { AmountBlock };
