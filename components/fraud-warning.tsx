import { AlertTriangle } from "lucide-react"
import { Card } from "@/components/ui/card"

export function FraudWarning() {
  return (
    <Card className="mb-6 border-l-4 border-l-[#FF7F50] bg-[#FF7F50]/5">
      <div className="p-4 flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-[#FF7F50] flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-[#1F0C11] mb-1">Attention Aux Arnaque</h3>
          <ul className="text-sm text-[#1F0C11]/80 space-y-1">
            <li>• Ne payez jamais avant de recevoir l'article</li>
            <li>• Méfiez-vous des offres trop belles pour être vraies</li>
            <li>• Effectuez les transactions en personne si possible</li>
            <li>• Utilisez des méthodes de paiement sécurisées</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
