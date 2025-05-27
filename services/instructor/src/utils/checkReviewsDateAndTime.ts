import { BadRequestError } from "@codeflare/common";

/**
 * Checks if a given date and time are over
 * @param date - The date of the review
 * @param time - The time of the review
 * @param type - The type of review (e.g. practical, theory)
 * @returns A boolean indicating whether the review date and time are over
 */
export const isReviewsDateAndTimeOver = async (
    date: Date,
    time: string,
    type: string
): Promise<boolean> => {
    try {
        const currentDate = new Date();

        if (!date || !time) return false;

        const [hour, minute] = time.split(":").map(Number);
        const reviewDateTime = new Date(date);
        reviewDateTime.setHours(hour, minute, 0, 0);

        if (currentDate >= reviewDateTime) {
            return true;
        } else {
            return false;
        }
    } catch (err: unknown) {
        throw new BadRequestError(`Failed to update review's ${type}!`);
    }
};
