"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock Button component
const Button = ({
    className,
    variant = "default",
    size = "default",
    disabled,
    onClick,
    children,
    style,
    ...props
}) => {
    const buttonStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'calc(var(--radius) - 2px)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.15s',
        outline: 'none',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        ...style,
    };

    const variants = {
        default: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
        },
    };

    const sizes = {
        default: {
            height: '2.25rem',
            padding: '0 1rem',
        },
        icon: {
            width: '2rem',
            height: '2rem',
        },
    };

    const buttonStyle = {
        ...buttonStyles,
        ...variants[variant],
        ...sizes[size],
    };

    return (
        <button
            className={className}
            style={buttonStyle}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

const CarouselContext = React.createContext(null);

function useCarousel() {
    const context = React.useContext(CarouselContext);

    if (!context) {
        throw new Error("useCarousel must be used within a <Carousel />");
    }

    return context;
}

export function Carousel({
    orientation = "horizontal",
    opts,
    setApi,
    plugins,
    className,
    children,
    style,
    ...props
}) {
    const [carouselRef, api] = useEmblaCarousel(
        {
            ...opts,
            axis: orientation === "horizontal" ? "x" : "y",
        },
        plugins,
    );
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);

    const onSelect = React.useCallback((api) => {
        if (!api) return;
        setCanScrollPrev(api.canScrollPrev());
        setCanScrollNext(api.canScrollNext());
    }, []);

    const scrollPrev = React.useCallback(() => {
        api?.scrollPrev();
    }, [api]);

    const scrollNext = React.useCallback(() => {
        api?.scrollNext();
    }, [api]);

    const handleKeyDown = React.useCallback(
        (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                scrollPrev();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                scrollNext();
            }
        },
        [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
        if (!api || !setApi) return;
        setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
        if (!api) return;
        onSelect(api);
        api.on("reInit", onSelect);
        api.on("select", onSelect);

        return () => {
            api?.off("select", onSelect);
        };
    }, [api, onSelect]);

    return (
        <CarouselContext.Provider
            value={{
                carouselRef,
                api: api,
                opts,
                orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
                scrollPrev,
                scrollNext,
                canScrollPrev,
                canScrollNext,
            }}
        >
            <div
                onKeyDownCapture={handleKeyDown}
                style={{
                    position: 'relative',
                    ...style,
                }}
                className={className}
                role="region"
                aria-roledescription="carousel"
                data-slot="carousel"
                {...props}
            >
                {children}
            </div>
        </CarouselContext.Provider>
    );
}

export function CarouselContent({ className, style, ...props }) {
    const { carouselRef, orientation } = useCarousel();

    return (
        <div
            ref={carouselRef}
            style={{
                overflow: 'hidden',
            }}
            data-slot="carousel-content"
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: orientation === "horizontal" ? 'row' : 'column',
                    marginLeft: orientation === "horizontal" ? '-1rem' : 0,
                    marginTop: orientation === "vertical" ? '-1rem' : 0,
                    ...style,
                }}
                className={className}
                {...props}
            />
        </div>
    );
}

export function CarouselItem({ className, style, ...props }) {
    const { orientation } = useCarousel();

    return (
        <div
            role="group"
            aria-roledescription="slide"
            data-slot="carousel-item"
            style={{
                minWidth: 0,
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: '100%',
                paddingLeft: orientation === "horizontal" ? '1rem' : 0,
                paddingTop: orientation === "vertical" ? '1rem' : 0,
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CarouselPrevious({
    className,
    variant = "outline",
    size = "icon",
    style,
    ...props
}) {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    const positionStyles = orientation === "horizontal"
        ? {
            top: '50%',
            left: '-3rem',
            transform: 'translateY(-50%)',
        }
        : {
            top: '-3rem',
            left: '50%',
            transform: 'translateX(-50%) rotate(90deg)',
        };

    return (
        <Button
            data-slot="carousel-previous"
            variant={variant}
            size={size}
            style={{
                position: 'absolute',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                ...positionStyles,
                ...style,
            }}
            className={className}
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            {...props}
        >
            <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                Previous slide
            </span>
        </Button>
    );
}

export function CarouselNext({
    className,
    variant = "outline",
    size = "icon",
    style,
    ...props
}) {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    const positionStyles = orientation === "horizontal"
        ? {
            top: '50%',
            right: '-3rem',
            transform: 'translateY(-50%)',
        }
        : {
            bottom: '-3rem',
            left: '50%',
            transform: 'translateX(-50%) rotate(90deg)',
        };

    return (
        <Button
            data-slot="carousel-next"
            variant={variant}
            size={size}
            style={{
                position: 'absolute',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                ...positionStyles,
                ...style,
            }}
            className={className}
            disabled={!canScrollNext}
            onClick={scrollNext}
            {...props}
        >
            <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            <span style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}>
                Next slide
            </span>
        </Button>
    );
}

// Default export for convenience
export default {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
};