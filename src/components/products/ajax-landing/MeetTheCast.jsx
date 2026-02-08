import { Card } from "../../ui/card";

export default function MeetTheCast() {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.4em] text-secondary">Meet the cast</p>
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
            The Pig, the Wolf, and the Brain
          </h2>
          <p className="text-xl text-center text-muted-foreground">
            Three characters. One story. Your home stays safe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Pig - the Homeowner */}
          <Card className="p-8 text-center border-2 hover:shadow-lg transition-all duration-300">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl shadow-lg bg-gradient-to-br from-primary to-primary/80">
                <span role="img" aria-label="Pig homeowner">
                  🐷
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Pig – the Homeowner</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is you. You just want to lock up, sleep, and know someone will yell if the wolf tries anything.
            </p>
          </Card>

          {/* Wolf - the Problem */}
          <Card className="p-8 text-center border-2 hover:shadow-lg transition-all duration-300">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl shadow-lg bg-gradient-to-br from-muted to-muted/80">
                <span role="img" aria-label="Wolf intruder">
                  🐺
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Wolf – the Problem</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is the troublemaker. He jiggles windows, tries doors, maybe checks if the Wi-Fi is down.
            </p>
          </Card>

          {/* Ajax Hub 2 - the Brain */}
          <Card className="p-8 text-center border-2 hover:shadow-lg transition-all duration-300">
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl shadow-lg bg-gradient-to-br from-secondary to-secondary/80 ring-4 ring-secondary/30">
                <span role="img" aria-label="Ajax Hub 2 brain">
                  🧠
                </span>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">Ajax Hub 2 (4G) – the Brain</h3>
            <p className="text-muted-foreground leading-relaxed">
              This is the brain of the system. All sensors talk to it. It talks to you and the monitoring centre.
              <br />
              <span className="font-semibold text-foreground mt-2 inline-block">
                If anything feels wrong, it screams for you.
              </span>
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}

