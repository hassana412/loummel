import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Handshake, MapPin, Target, TrendingUp, Award, 
  Check, Calculator, Gift, Users
} from "lucide-react";
import { getAllRegionNames, getDepartmentsByRegion, getArrondissementsByDepartment } from "@/data/cameroon-regions";
import { COMMISSION_RATE, BASE_SUBSCRIPTION_PRICE, BONUS_LEVELS } from "@/types/partner";

const DevenirPartenaire = () => {
  const navigate = useNavigate();
  const regions = getAllRegionNames();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    departments: [] as string[],
    arrondissements: [] as string[],
    intercommunautaire: false,
    dailyRecruitment: 1,
  });

  const availableDepartments = useMemo(() => {
    if (!formData.region) return [];
    return getDepartmentsByRegion(formData.region);
  }, [formData.region]);

  const availableArrondissements = useMemo(() => {
    if (!formData.region || formData.departments.length === 0) return [];
    const arrs: string[] = [];
    formData.departments.forEach(dept => {
      arrs.push(...getArrondissementsByDepartment(formData.region, dept));
    });
    return arrs;
  }, [formData.region, formData.departments]);

  // Calculations
  const projections = useMemo(() => {
    const daily = formData.dailyRecruitment || 0;
    return {
      perWeek: daily * 7,
      perMonth: daily * 30,
      perYear: daily * 365,
    };
  }, [formData.dailyRecruitment]);

  const commissionPerShop = BASE_SUBSCRIPTION_PRICE * COMMISSION_RATE;

  const commissions = useMemo(() => {
    return {
      perShop: commissionPerShop,
      perWeek: projections.perWeek * commissionPerShop,
      perMonth: projections.perMonth * commissionPerShop,
      perYear: projections.perYear * commissionPerShop,
    };
  }, [projections, commissionPerShop]);

  const currentBonus = useMemo(() => {
    const monthly = projections.perMonth;
    for (let i = BONUS_LEVELS.length - 1; i >= 0; i--) {
      if (monthly >= BONUS_LEVELS[i].threshold) {
        return BONUS_LEVELS[i];
      }
    }
    return null;
  }, [projections.perMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDepartment = (dept: string) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept],
      arrondissements: [] // Reset arrondissements when departments change
    }));
  };

  const toggleArrondissement = (arr: string) => {
    setFormData(prev => ({
      ...prev,
      arrondissements: prev.arrondissements.includes(arr)
        ? prev.arrondissements.filter(a => a !== arr)
        : [...prev.arrondissements, arr]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Candidature envoyée !",
      description: "Notre équipe vous contactera dans les 48 heures.",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary to-sahel-ochre rounded-xl mb-4">
              <Handshake className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Devenir Partenaire Loummel
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Rejoignez notre réseau de partenaires commerciaux et gagnez des commissions 
              en recrutant des vendeurs dans votre région
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
            <Card className="shadow-sahel-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="Votre nom et prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+237 6XX XXX XXX"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coverage Zone */}
            <Card className="shadow-sahel-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Zone de Couverture
                </CardTitle>
                <CardDescription>
                  Sélectionnez la zone géographique que vous souhaitez couvrir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Region */}
                <div className="space-y-2">
                  <Label>Région *</Label>
                  <Select 
                    value={formData.region} 
                    onValueChange={(v) => {
                      updateFormData("region", v);
                      updateFormData("departments", []);
                      updateFormData("arrondissements", []);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Departments */}
                {availableDepartments.length > 0 && (
                  <div className="space-y-2">
                    <Label>Départements</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
                      {availableDepartments.map((dept) => (
                        <Badge
                          key={dept.name}
                          variant={formData.departments.includes(dept.name) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleDepartment(dept.name)}
                        >
                          {formData.departments.includes(dept.name) && <Check className="w-3 h-3 mr-1" />}
                          {dept.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Arrondissements */}
                {availableArrondissements.length > 0 && (
                  <div className="space-y-2">
                    <Label>Arrondissements</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg max-h-40 overflow-y-auto">
                      {availableArrondissements.map((arr) => (
                        <Badge
                          key={arr}
                          variant={formData.arrondissements.includes(arr) ? "default" : "outline"}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleArrondissement(arr)}
                        >
                          {formData.arrondissements.includes(arr) && <Check className="w-3 h-3 mr-1" />}
                          {arr}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Intercommunautaire */}
                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                  <Checkbox
                    id="intercommunautaire"
                    checked={formData.intercommunautaire}
                    onCheckedChange={(v) => updateFormData("intercommunautaire", v)}
                  />
                  <Label htmlFor="intercommunautaire" className="flex-1 cursor-pointer">
                    <span className="font-medium">Marché Intercommunautaire</span>
                    <p className="text-sm text-muted-foreground">
                      Couvrir les marchés entre plusieurs communautés et régions
                    </p>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Recruitment Goals */}
            <Card className="shadow-sahel-card">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Objectifs de Recrutement
                </CardTitle>
                <CardDescription>
                  Définissez vos objectifs journaliers de recrutement de boutiques
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dailyRecruitment">Boutiques à recruter par JOUR</Label>
                  <Input
                    id="dailyRecruitment"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.dailyRecruitment}
                    onChange={(e) => updateFormData("dailyRecruitment", parseInt(e.target.value) || 1)}
                    className="text-center text-xl font-bold w-32"
                  />
                </div>

                {/* Projections */}
                <div className="bg-gradient-to-r from-primary/5 to-sahel-ochre/5 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold">Projections Automatiques</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par semaine</p>
                      <p className="text-2xl font-bold text-foreground">{projections.perWeek}</p>
                      <p className="text-xs text-muted-foreground">boutiques</p>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par mois</p>
                      <p className="text-2xl font-bold text-foreground">{projections.perMonth}</p>
                      <p className="text-xs text-muted-foreground">boutiques</p>
                    </div>
                    <div className="text-center p-4 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par an</p>
                      <p className="text-2xl font-bold text-foreground">{projections.perYear}</p>
                      <p className="text-xs text-muted-foreground">boutiques</p>
                    </div>
                  </div>
                </div>

                {/* Commission Estimate */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Calculator className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">Commission Estimée (15%)</h4>
                  </div>
                  <p className="text-sm text-green-700 mb-4">
                    Commission par boutique (sur abonnement de base à 5 000 FCFA) : <strong>{formatCurrency(commissions.perShop)}</strong>
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par semaine</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(commissions.perWeek)}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par mois</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(commissions.perMonth)}</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Par an</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(commissions.perYear)}</p>
                    </div>
                  </div>
                </div>

                {/* Bonus Performance */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-800">Bonus Performance</h4>
                  </div>
                  <p className="text-sm text-amber-700 mb-4">
                    Recevez des bonus supplémentaires en fonction de votre performance mensuelle !
                  </p>
                  <div className="space-y-3">
                    {BONUS_LEVELS.map((level) => {
                      const isActive = currentBonus?.threshold === level.threshold;
                      return (
                        <div
                          key={level.threshold}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            isActive ? 'bg-amber-200 ring-2 ring-amber-400' : 'bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Award className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-muted-foreground'}`} />
                            <span className={isActive ? 'font-semibold' : ''}>
                              {level.threshold}+ boutiques/mois
                            </span>
                          </div>
                          <Badge variant={isActive ? "default" : "outline"} className={isActive ? 'bg-amber-500' : ''}>
                            +{level.bonusPercentage}% bonus ({level.label})
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                  {currentBonus && (
                    <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                      <p className="text-sm text-amber-800">
                        🎉 Avec vos objectifs actuels, vous atteindrez le niveau <strong>{currentBonus.label}</strong> 
                        {' '}et recevrez <strong>+{currentBonus.bonusPercentage}%</strong> de bonus sur vos commissions !
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex justify-center">
              <Button type="submit" variant="hero" size="lg" className="px-12">
                <Handshake className="w-5 h-5 mr-2" />
                Devenir Partenaire
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DevenirPartenaire;
