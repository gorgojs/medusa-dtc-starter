"use client"

import { useEffect, useRef, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"
import ZoomableImage from "@modules/common/components/zoomable-image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    imageRefs.current.forEach((ref, index) => {
      if (!ref) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(index)
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach((obs) => obs.disconnect())
    }
  }, [images])

  const handleThumbnailClick = (index: number) => {
    imageRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    })
  }

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col gap-3 w-[101px] shrink-0 sticky top-14 self-start">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => handleThumbnailClick(index)}
            className={`relative w-full h-[118px] overflow-hidden rounded-lg transition-all cursor-pointer ${
              activeIndex === index
                ? "ring-1 ring-ui-border-interactive"
                : "hover:ring-1 hover:ring-ui-bg-subtle"
            }`}
          >
            {!!image.url && (
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="101px"
                style={{ objectFit: "cover" }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col flex-1 gap-y-4">
        {images.map((image, index) => (
          <Container
            key={image.id}
            ref={(el) => {
              imageRefs.current[index] = el
            }}
            className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle"
            id={image.id}
          >
            {!!image.url && (
              <ZoomableImage
                src={image.url}
                alt={`Product image ${index + 1}`}
                priority={index <= 2}
                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                className="rounded-rounded"
              />
            )}
          </Container>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
