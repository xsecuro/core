import type { SeparatorKey } from "@/types"
import { XSecuroError } from "src/errors"

class Analyzer {
    private readonly password: string
    private readonly segmentation: boolean
    private segmentsCache: string[] | undefined

    public constructor(password: string, segmentation: boolean | 'auto' = 'auto', separator?: SeparatorKey) {
        this.password = password
        this.segmentation = this.detectSegmentation(segmentation, separator)
    }

    private detectSegmentation(segmentation: boolean | 'auto', separator?: SeparatorKey): boolean {
        if (segmentation) {
            return true
        } else if (!segmentation) {
            return false
        } else {
            if (separator === undefined) {
                throw new XSecuroError('For auto detect segmentation mode - separator is required!')
            }

            const segmentsCache = this.password.split(separator)
            const isSegmentation = segmentsCache.length > 1

            if (isSegmentation) this.segmentsCache = segmentsCache

            return isSegmentation
        }
    }

    // private analyzeSegment() {}

    public analyze() {
        if (this.segmentation) {
            this.segmentsCache?.map
        }
    }
}

export { Analyzer }
