import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const categories = await Promise.all(
    [
      { name: "Cuidado facial", slug: "cuidado-facial", order: 1 },
      { name: "Corpo & banho", slug: "corpo-banho", order: 2 },
      { name: "Cabelo", slug: "cabelo", order: 3 },
      { name: "Fragrâncias", slug: "fragrancias", order: 4 },
    ].map((c) =>
      prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c }),
    ),
  );

  const [facial, corpo, cabelo, fragrancias] = categories;

  const products = [
    {
      name: "Óleo Facial de Baobá",
      slug: "oleo-facial-baoba",
      shortDesc: "Nutrição profunda para a pele, com óleo de baobá angolano.",
      story:
        "Nasceu da árvore que resiste a todas as estações. O baobá é colhido por pequenas cooperativas do sul de Angola e prensado a frio para preservar cada nutriente.",
      ritual:
        "Aplica 3 a 4 gotas na pele limpa, de manhã e à noite, massajando suavemente até absorver.",
      priceCents: 1850000,
      compareAtCents: null,
      stock: 24,
      featured: true,
      curatedMonth: true,
      categoryId: facial.id,
      images: [
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop",
      ],
    },
    {
      name: "Manteiga Corporal de Karité",
      slug: "manteiga-corporal-karite",
      shortDesc: "Hidratação intensa para peles secas, com aroma suave de baunilha.",
      story:
        "Feita à mão com karité puro, esta manteiga é o ritual final de qualquer duche — um momento só para ti.",
      ritual: "Aplica generosamente após o duche, ainda com a pele húmida.",
      priceCents: 1450000,
      compareAtCents: 1650000,
      stock: 40,
      featured: true,
      curatedMonth: true,
      categoryId: corpo.id,
      images: [
        "https://images.unsplash.com/photo-1600428853876-fb5a850b444c?q=80&w=1200&auto=format&fit=crop",
      ],
    },
    {
      name: "Óleo Capilar Reparador",
      slug: "oleo-capilar-reparador",
      shortDesc: "Brilho e força para cabelos afro e cacheados.",
      story:
        "Uma mistura de óleos angolanos pensada para cabelos que precisam de mais cuidado — sem pesar, sem oleosidade.",
      ritual: "Aplica nas pontas antes de pentear ou como máscara semanal.",
      priceCents: 1250000,
      compareAtCents: null,
      stock: 30,
      featured: false,
      curatedMonth: true,
      categoryId: cabelo.id,
      images: [
        "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?q=80&w=1200&auto=format&fit=crop",
      ],
    },
    {
      name: "Água de Perfume Terra Vermelha",
      slug: "agua-perfume-terra-vermelha",
      shortDesc: "Uma fragrância quente e envolvente, inspirada na savana angolana.",
      story:
        "Notas de âmbar, madeira e uma pitada de baunilha — uma homenagem ao pôr do sol angolano.",
      ritual: "Aplica no pulso e no pescoço, deixando a fragrância desenvolver-se naturalmente.",
      priceCents: 3200000,
      compareAtCents: null,
      stock: 15,
      featured: true,
      curatedMonth: true,
      categoryId: fragrancias.id,
      images: [
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop",
      ],
    },
    {
      name: "Sabonete Artesanal de Coco",
      slug: "sabonete-artesanal-coco",
      shortDesc: "Limpeza suave para todos os tipos de pele.",
      story: "Feito à mão, com óleo de coco e glicerina vegetal, sem químicos agressivos.",
      ritual: "Usa diariamente no duche ou lavagem das mãos.",
      priceCents: 650000,
      compareAtCents: null,
      stock: 60,
      featured: false,
      curatedMonth: false,
      categoryId: corpo.id,
      images: [
        "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=1200&auto=format&fit=crop",
      ],
    },
    {
      name: "Sérum Facial de Vitamina C",
      slug: "serum-facial-vitamina-c",
      shortDesc: "Luminosidade e uniformidade para a pele do rosto.",
      story:
        "Formulado para climas quentes, este sérum leve protege e ilumina sem pesar na pele.",
      ritual: "Aplica de manhã, antes do protetor solar.",
      priceCents: 2450000,
      compareAtCents: 2800000,
      stock: 18,
      featured: false,
      curatedMonth: false,
      categoryId: facial.id,
      images: [
        "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop",
      ],
    },
  ];

  for (const product of products) {
    const { images, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...data,
        images: { create: images.map((url, i) => ({ url, alt: product.name, order: i })) },
      },
    });
  }

  const passwordHash = await bcrypt.hash("deodalia2026", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@deodaliadias.co.ao" },
    update: {},
    create: {
      name: "Equipa Deodália Dias",
      email: "admin@deodaliadias.co.ao",
      passwordHash,
    },
  });

  console.log("Seed concluído. Login admin: admin@deodaliadias.co.ao / deodalia2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
