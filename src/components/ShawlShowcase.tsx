"use client";

import { useImageModal } from "./ImageModal";

const F = "https://commons.wikimedia.org/wiki/Special:FilePath";

const tiles = [
  { src: `${F}/Shikara_in_Dal_Lake_in_Kashmir.JPG`, alt: "Shikara in Dal Lake", tag: "Dal Lake" },
  { src: `${F}/Kashmiri_pashmina_weaver_in_Srinagar.jpg`, alt: "Kashmiri Pashmina Weaver", tag: "Weaving" },
  { src: `${F}/Majestic_snow_capped_mountains_at_Gulmarg,_Kashmir,_India.jpg`, alt: "Majestic Snow Capped Mountains, Gulmarg", tag: "Mountains" },
  { src: `${F}/Houseboat-_Dal_Lake,_srinagar_Kashmir.JPG`, alt: "Dal Lake Houseboat", tag: "Srinagar" },
  { src: `${F}/Changthangi_goat.jpg`, alt: "Changthangi Pashmina Goat", tag: "The Source" },
  { src: `${F}/Papier-mâché_Interior_of_Shah-e-Hamdan_(14573373322).jpg`, alt: "Papier-Mâché Interior of Shah-e-Hamdan", tag: "Heritage" },
  { src: `${F}/Embroidered-pashmina-shawl.jpg`, alt: "Hand Embroidered Sozni Pashmina Shawl", tag: "Embroidery" },
  { src: `https://media.istockphoto.com/id/908262810/photo/water-flowing-at-hill-station-of-sonamarg-jammu-and-kashmir-valley-of-flowers-aqua-marine.jpg?s=612x612&w=0&k=20&c=pEx6tRQVhtn0w0tPXbuJENoqVkrurAKYP-ztu5u9Xqk=`, alt: "Sonamarg River Landscape", tag: "Sonmarg" },
  { src: `${F}/Walnut_wood_carving.jpg`, alt: "Traditional Walnut Wood Carving Art", tag: "Woodwork" },
  { src: `${F}/Houseboat_at_Dal_Lake,_Srinagar.jpg`, alt: "Houseboat at Dal Lake Sunrise", tag: "Dal Lake" },
  { src: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcNdC4L14t4hRKwEMtdP5AGcwB2uKJ1HjOcA&s`, alt: "Changpa Nomads Spinning Pashmina Yarn", tag: "Spinning" },
  { src: `https://gos3.ibcdn.com/a22b43fb-fd66-4a6a-b1dd-b720ef383866.jpg`, alt: "Snow Covered Hut in Gulmarg", tag: "Gulmarg" },
  { src: `${F}/Antique_Kashmiri_Pashmina_Dorukha_Shawl_circa_1870_-_courtesy_Wovensouls_collection,_Singapore.jpg`, alt: "Antique Pashmina Dorukha Kani Shawl", tag: "Heritage" },
  { src: `${F}/Kashmiri_Kangri.jpg`, alt: "Traditional Kashmiri Kangri (Fire Pot)", tag: "Tradition" },
  { src: `${F}/Dal_Lake_srinagar_kashmir.jpg`, alt: "Dal Lake Srinagar Night View", tag: "Srinagar" },
  { src: `https://cdn.shopify.com/s/files/1/1395/5787/files/Weaver_1.jpg?v=1661842729`, alt: "Carpet Weavers in Srinagar", tag: "Craft" },
  { src: `${F}/Snow_covered_mountain_range_in_Pahalgam.jpg`, alt: "Snow Covered Mountain Range in Pahalgam", tag: "Pahalgam" },
  { src: `https://m.media-amazon.com/images/I/61CD7fSop0L._AC_UF894,1000_QL80_.jpg`, alt: "Kashmiri Copper Samovar (Teapot)", tag: "Samovar" },
  { src: `${F}/Pashmina_goats.jpg`, alt: "Pashmina Goats Herd in Ladakh", tag: "Ladakh" },
  { src: `${F}/Papier-mâché_at_Naqshband_Sahib_Shrine_(14362830460).jpg`, alt: "Papier-Mâché at Naqshband Sahib Shrine", tag: "Papier-Mâché" },
  { src: `https://live.staticflickr.com/65535/51752787369_c011925dcf_b.jpg`, alt: "Snow in Gulmarg with Gondola", tag: "Gulmarg" },
  { src: `https://www.mirascrafts.com/wp-content/uploads/2018/12/Silk-Carpets.jpg`, alt: "Traditional Carpet Talim Pattern", tag: "Talim" },
  { src: `https://travelsolution.dukekashmirtravels.com/sphoto/40/dal-lake.jpg`, alt: "Dal Lake and Surroundings", tag: "Dal Lake" },
  { src: `${F}/Pashmina_Goat.jpg`, alt: "High Altitude Pashmina Goat Portrait", tag: "Ladakh" },
  { src: `https://static.wixstatic.com/media/c61f3c_7fdfa4c620e5480e8af7aa35782ca320~mv2.png/v1/fill/w_568,h_320,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/c61f3c_7fdfa4c620e5480e8af7aa35782ca320~mv2.png`, alt: "Kashmiri Papier-Mâché Goods", tag: "Craft" },
  { src: `${F}/Snow_covered_gulmarg_landscape_2.jpg`, alt: "Snow Covered Gulmarg Landscape", tag: "Gulmarg" },
  { src: `https://kashmirobserver.net/wp-content/uploads/2022/10/Wular-Lake.jpg`, alt: "Wular Lake View", tag: "Wular Lake" },
  { src: `${F}/Kunas_-_Wular_Lake,_by_George_Strahan.jpg`, alt: "Wular Lake 1894 Painting", tag: "Heritage" },
  { src: `https://images.moneycontrol.com/static-mcnews/2021/12/Pheran-man-and-grandson-photo-Dardic-warrior-via-wikimedia-commons.jpg`, alt: "Kashmiri Old Man in Traditional Pheran", tag: "Culture" },
];

function TileRow({ onTileClick }: { onTileClick: (src: string, alt: string) => void }) {
  return (
    <>
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="group relative flex-shrink-0 cursor-pointer"
          onClick={() => onTileClick(tile.src, tile.alt)}
        >
          <div className="relative h-[260px] w-[200px] overflow-hidden rounded-xl sm:h-[320px] sm:w-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt={tile.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className="font-accent block text-[9px] uppercase tracking-[0.2em] text-gold">
                {tile.tag}
              </span>
              <span className="mt-0.5 block text-xs leading-snug text-ivory/80">
                {tile.alt}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export default function ShawlShowcase() {
  const { open } = useImageModal();

  return (
    <section className="overflow-hidden bg-charcoal py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-accent text-[10px] font-light uppercase tracking-[0.35em] text-gold">
          The Land That Weaves
        </p>
        <h2 className="mt-4 font-heading text-3xl font-light text-ivory sm:text-4xl">
          Stories from <span className="italic">Kashmir</span>
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ivory/70">
          From the snow peaks of Gulmarg to the looms of Srinagar — every
          thread carries the spirit of the valley.
        </p>
      </div>

      <div className="mt-10 sm:mt-12" aria-hidden="true">
        <div className="animate-shawl-scroll flex w-max gap-4">
          <div className="flex shrink-0 gap-4">
            <TileRow onTileClick={open} />
          </div>
          <div className="flex shrink-0 gap-4">
            <TileRow onTileClick={open} />
          </div>
        </div>
      </div>
    </section>
  );
}
