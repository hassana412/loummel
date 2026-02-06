import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Flame,
  Store,
  Gift,
  Sparkles
} from "lucide-react";

interface Flyer {
  id: string;
  type: 'promo' | 'new_shop' | 'deal' | 'event';
  title: string;
  subtitle: string;
  description: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  badge: string | null;
  discount: string | null;
  end_date: string | null;
  gradient: string;
  is_active: boolean;
  sort_order: number;
}

const gradientOptions = [
  { value: 'from-red-600 via-orange-500 to-yellow-500', label: 'Rouge → Orange → Jaune' },
  { value: 'from-emerald-600 via-teal-500 to-cyan-500', label: 'Vert → Teal → Cyan' },
  { value: 'from-violet-600 via-purple-500 to-pink-500', label: 'Violet → Purple → Rose' },
  { value: 'from-amber-500 via-yellow-500 to-orange-400', label: 'Ambre → Jaune → Orange' },
  { value: 'from-blue-600 via-indigo-500 to-purple-500', label: 'Bleu → Indigo → Purple' },
  { value: 'from-pink-500 via-rose-500 to-red-500', label: 'Rose → Red' },
];

const typeOptions = [
  { value: 'deal', label: 'Vente Flash', icon: Flame },
  { value: 'new_shop', label: 'Nouvelle Boutique', icon: Store },
  { value: 'promo', label: 'Promotion', icon: Gift },
  { value: 'event', label: 'Événement', icon: Sparkles },
];

const FlyerManager = () => {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Flyer>>({
    type: 'promo',
    title: '',
    subtitle: '',
    description: '',
    cta_text: 'Voir',
    cta_link: '/recherche',
    badge: '',
    discount: '',
    gradient: 'from-red-600 via-orange-500 to-yellow-500',
    is_active: true,
  });

  useEffect(() => {
    fetchFlyers();
  }, []);

  const fetchFlyers = async () => {
    const { data, error } = await supabase
      .from('flyers')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else if (data) {
      // Type assertion since DB returns string for type field
      const typedFlyers = data.map(f => ({
        ...f,
        type: f.type as 'promo' | 'new_shop' | 'deal' | 'event'
      }));
      setFlyers(typedFlyers);
    }
  };

  const handleCreate = async () => {
    const maxOrder = Math.max(...flyers.map(f => f.sort_order), 0);
    
    const { error } = await supabase.from('flyers').insert({
      type: formData.type,
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      cta_text: formData.cta_text,
      cta_link: formData.cta_link,
      badge: formData.badge,
      discount: formData.discount,
      gradient: formData.gradient,
      is_active: formData.is_active,
      sort_order: maxOrder + 1,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Flyer créé avec succès" });
      setIsCreating(false);
      resetForm();
      fetchFlyers();
    }
  };

  const handleUpdate = async (id: string) => {
    const { error } = await supabase
      .from('flyers')
      .update(formData)
      .eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Flyer mis à jour" });
      setEditingId(null);
      resetForm();
      fetchFlyers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce flyer ?")) return;

    const { error } = await supabase.from('flyers').delete().eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Succès", description: "Flyer supprimé" });
      fetchFlyers();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('flyers')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      fetchFlyers();
    }
  };

  const moveFlyer = async (id: string, direction: 'up' | 'down') => {
    const index = flyers.findIndex(f => f.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= flyers.length) return;

    const currentFlyer = flyers[index];
    const swapFlyer = flyers[newIndex];

    await supabase.from('flyers').update({ sort_order: swapFlyer.sort_order }).eq('id', currentFlyer.id);
    await supabase.from('flyers').update({ sort_order: currentFlyer.sort_order }).eq('id', swapFlyer.id);
    
    fetchFlyers();
  };

  const startEdit = (flyer: Flyer) => {
    setEditingId(flyer.id);
    setFormData(flyer);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'promo',
      title: '',
      subtitle: '',
      description: '',
      cta_text: 'Voir',
      cta_link: '/recherche',
      badge: '',
      discount: '',
      gradient: 'from-red-600 via-orange-500 to-yellow-500',
      is_active: true,
    });
  };

  const getTypeIcon = (type: string) => {
    const option = typeOptions.find(t => t.value === type);
    if (option) {
      const Icon = option.icon;
      return <Icon className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Gestion des Flyers Publicitaires
        </CardTitle>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Nouveau Flyer
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v) => setFormData({ ...formData, type: v as Flyer['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <opt.icon className="w-4 h-4" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Gradient</Label>
                  <Select 
                    value={formData.gradient} 
                    onValueChange={(v) => setFormData({ ...formData, gradient: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradientOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <div className={`w-8 h-4 rounded bg-gradient-to-r ${opt.value}`} />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Titre</Label>
                  <Input 
                    value={formData.title || ''} 
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="🔥 Ventes Flash"
                  />
                </div>
                <div>
                  <Label>Sous-titre</Label>
                  <Input 
                    value={formData.subtitle || ''} 
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Jusqu'à -50%"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description || ''} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description du flyer..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Badge</Label>
                  <Input 
                    value={formData.badge || ''} 
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="PROMO"
                  />
                </div>
                <div>
                  <Label>Réduction</Label>
                  <Input 
                    value={formData.discount || ''} 
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                    placeholder="-50%"
                  />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input 
                    type="datetime-local"
                    value={formData.end_date ? formData.end_date.slice(0, 16) : ''} 
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Texte du bouton</Label>
                  <Input 
                    value={formData.cta_text || ''} 
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Voir les offres"
                  />
                </div>
                <div>
                  <Label>Lien du bouton</Label>
                  <Input 
                    value={formData.cta_link || ''} 
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="/recherche?promo=true"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Actif</Label>
              </div>

              <div className="flex gap-2 pt-2">
                {isCreating ? (
                  <Button onClick={handleCreate}>
                    <Save className="w-4 h-4 mr-1" />
                    Créer
                  </Button>
                ) : (
                  <Button onClick={() => handleUpdate(editingId!)}>
                    <Save className="w-4 h-4 mr-1" />
                    Enregistrer
                  </Button>
                )}
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Flyers List */}
        <div className="space-y-2">
          {flyers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun flyer publicitaire. Cliquez sur "Nouveau Flyer" pour en créer un.
            </p>
          ) : (
            flyers.map((flyer, index) => (
              <div 
                key={flyer.id} 
                className={`flex items-center gap-4 p-4 rounded-lg border ${
                  flyer.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                {/* Preview */}
                <div className={`w-16 h-12 rounded-lg bg-gradient-to-r ${flyer.gradient} flex items-center justify-center text-white shrink-0`}>
                  {getTypeIcon(flyer.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{flyer.title}</span>
                    {flyer.badge && (
                      <Badge variant="outline" className="text-xs">{flyer.badge}</Badge>
                    )}
                    {flyer.discount && (
                      <Badge className="bg-destructive text-destructive-foreground text-xs">{flyer.discount}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{flyer.subtitle}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => moveFlyer(flyer.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => moveFlyer(flyer.id, 'down')}
                    disabled={index === flyers.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => toggleActive(flyer.id, flyer.is_active)}
                  >
                    {flyer.is_active ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => startEdit(flyer)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(flyer.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FlyerManager;
