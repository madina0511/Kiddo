import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExchangeRateService {
	private readonly logger = new Logger(ExchangeRateService.name);
	private cachedRate: number | null = null;
	private lastFetchedAt: number = 0;
	private readonly CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 soat

	async getUsdToKrwRate(): Promise<number> {
		const now = Date.now();

		if (this.cachedRate && now - this.lastFetchedAt < this.CACHE_DURATION_MS) {
			return this.cachedRate;
		}

		try {
			const response = await axios.get('https://api.frankfurter.dev/v1/latest', {
				params: { base: 'USD', symbols: 'KRW' },
				timeout: 5000,
			});

			const rate = response.data?.rates?.KRW;
			if (!rate) throw new Error('KRW rate not found in response');

			this.cachedRate = rate;
			this.lastFetchedAt = now;
			this.logger.log(`Exchange rate updated: 1 USD = ${rate} KRW`);
			return rate;
		} catch (err) {
			this.logger.error('Failed to fetch exchange rate, using fallback', err);
			// Agar API ishlamasa, oldingi keshlangan qiymatni yoki fallback'ni qaytaramiz
			return this.cachedRate ?? 1350; // taxminiy fallback kurs
		}
	}

	async convertUsdToKrw(usdAmount: number): Promise<number> {
		const rate = await this.getUsdToKrwRate();
		return Math.round(usdAmount * rate);
	}
}
