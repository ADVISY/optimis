import { useState } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle2, Loader2 } from "lucide-react";

const Avis = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

  const [note, setNote] = useState(0);
  const [hover, setHover] = useState(0);
  const [auteur, setAuteur] = useState("");
  const [ville, setVille] = useState("");
  const [email, setEmail] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note < 1) {
      toast({
        title: t("avis.errorNoteTitle", "Note manquante"),
        description: t("avis.errorNoteDesc", "Merci de sélectionner une note entre 1 et 5 étoiles."),
        variant: "destructive",
      });
      return;
    }
    if (!auteur.trim() || !commentaire.trim()) {
      toast({
        title: t("avis.errorFieldsTitle", "Champs requis"),
        description: t("avis.errorFieldsDesc", "Merci d'indiquer votre nom et votre avis."),
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    // La table `avis` n'est pas encore dans les types générés → cast souple.
    const { error } = await (supabase as any).from("avis").insert({
      auteur: auteur.trim(),
      ville: ville.trim() || null,
      note,
      commentaire: commentaire.trim(),
      email: email.trim() || null,
      langue: i18n.language || "fr",
      source: "site",
      statut: "en_attente",
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: t("avis.errorSubmitTitle", "Envoi impossible"),
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setDone(true);
  };

  return (
    <Layout>
      <Seo
        routeKey="avis"
        noindex
        title={t("avis.seoTitle", "Votre avis sur Optimis")}
        description={t("avis.seoDesc", "Partagez votre expérience avec le comparateur d'assurances Optimis.")}
        canonicalPath={`${i18n.language || "fr"}/avis`}
      />
      <div className="container py-12 md:py-16 max-w-2xl">
        {done ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-9 w-9 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t("avis.thanksTitle", "Merci pour votre avis !")}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {t(
                "avis.thanksDesc",
                "Votre retour a bien été enregistré. Après une brève vérification par notre équipe, il pourra apparaître sur notre site.",
              )}
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {t("avis.title", "Votre avis compte")}
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t(
                  "avis.subtitle",
                  "Partagez votre expérience avec Optimis. Votre retour nous aide à améliorer notre comparateur et guide d'autres Suisses dans leur choix.",
                )}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-2xl border shadow-sm space-y-6">
              {/* Note en étoiles */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t("avis.ratingLabel", "Votre note")}
                </label>
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
                        className={`h-8 w-8 transition-colors ${
                          (hover || note) >= v
                            ? "fill-accent text-accent"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("avis.nameLabel", "Votre nom")} *
                  </label>
                  <Input
                    value={auteur}
                    onChange={(e) => setAuteur(e.target.value)}
                    placeholder={t("avis.namePlaceholder", "Ex. Laurent W.")}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {t("avis.cityLabel", "Ville / Canton")}
                  </label>
                  <Input
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder={t("avis.cityPlaceholder", "Ex. Lausanne")}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("avis.emailLabel", "Email")} <span className="text-muted-foreground font-normal">({t("avis.optional", "facultatif")})</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("avis.emailPlaceholder", "vous@exemple.ch")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("avis.emailHelp", "Non publié — uniquement si nous devons vous recontacter.")}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t("avis.commentLabel", "Votre avis")} *
                </label>
                <Textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder={t("avis.commentPlaceholder", "Qu'avez-vous pensé de votre expérience sur Optimis ?")}
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("avis.submitting", "Envoi…")}
                  </>
                ) : (
                  t("avis.submit", "Envoyer mon avis")
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t("avis.moderationNote", "Les avis sont vérifiés avant publication.")}
              </p>
            </form>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Avis;
