import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Star, Loader2, CheckCircle2 } from "lucide-react";

const SESSION_KEY = "avis_prompt_seen";

/**
 * Petite fenêtre (modale) qui apparaît sur les pages « merci » pour inviter
 * l'utilisateur satisfait à laisser un avis (note + petit message).
 * Alimente la même table `avis` (statut `en_attente`, source `merci`) →
 * modérable depuis /admin/avis. S'affiche une seule fois par session.
 */
const AvisPromptDialog = ({ delayMs = 1500 }: { delayMs?: number }) => {
  const { t, i18n } = useTranslation();

  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);
  const [auteur, setAuteur] = useState("");
  const [ville, setVille] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") return;
    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note < 1) return;

    setSubmitting(true);
    // La table `avis` n'est pas encore dans les types générés → cast souple.
    const { error } = await (supabase as any).from("avis").insert({
      auteur: auteur.trim() || t("avisPrompt.anonymous", "Client Optimis"),
      ville: ville.trim() || null,
      note,
      commentaire:
        commentaire.trim() ||
        t("avisPrompt.defaultComment", "Expérience positive avec le comparateur Optimis."),
      langue: i18n.language || "fr",
      source: "merci",
      statut: "en_attente",
    });
    setSubmitting(false);

    if (!error) {
      setDone(true);
      setTimeout(() => setOpen(false), 2200);
    } else {
      // En cas d'échec silencieux, on ferme sans bloquer l'utilisateur.
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl mb-2">
              {t("avisPrompt.thanksTitle", "Merci beaucoup !")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "avisPrompt.thanksDesc",
                "Votre avis a bien été enregistré. Il apparaîtra sur notre site après vérification.",
              )}
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {t("avisPrompt.title", "Votre expérience compte !")}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "avisPrompt.subtitle",
                  "Vous avez apprécié le comparateur Optimis ? Partagez votre avis en quelques secondes.",
                )}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Note en étoiles */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setNote(v)}
                      onMouseEnter={() => setHover(v)}
                      onMouseLeave={() => setHover(0)}
                      className="p-1 transition-transform hover:scale-110"
                      aria-label={`${v} ${v > 1 ? t("avis.stars", "étoiles") : t("avis.star", "étoile")}`}
                    >
                      <Star
                        className={`h-9 w-9 transition-colors ${
                          (hover || note) >= v
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {note > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {note === 5
                      ? t("avisPrompt.rating5", "Excellent !")
                      : note >= 4
                        ? t("avisPrompt.rating4", "Très bien")
                        : t("avisPrompt.rating3", "Merci pour votre retour")}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={auteur}
                  onChange={(e) => setAuteur(e.target.value)}
                  placeholder={t("avisPrompt.namePlaceholder", "Votre prénom (facultatif)")}
                />
                <Input
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder={t("avisPrompt.cityPlaceholder", "Ville (facultatif)")}
                />
              </div>

              <Textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder={t(
                  "avisPrompt.commentPlaceholder",
                  "Qu'avez-vous pensé du site ? (facultatif)",
                )}
                rows={3}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  {t("avisPrompt.later", "Plus tard")}
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting || note < 1}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("avis.submitting", "Envoi…")}
                    </>
                  ) : (
                    t("avisPrompt.submit", "Envoyer")
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AvisPromptDialog;
