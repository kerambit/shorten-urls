<template>
    <v-app>
        <v-main>
            <v-container>
                <v-row>
                    <v-col cols="12">
                        <h1 class="text-h4 mb-4">URL Shortener</h1>

                        <v-card class="mb-4">
                            <v-card-text>
                                <v-form @submit.prevent="handleCreate">
                                    <v-text-field
                                        v-model="url"
                                        label="Enter URL"
                                        required
                                        :rules="[
                                            (v) => !!v || 'URL is required',
                                        ]"
                                    ></v-text-field>

                                    <v-text-field
                                        v-model="alias"
                                        label="Custom Alias (optional)"
                                        :rules="[
                                            (v) =>
                                                !v ||
                                                v.length <= 25 ||
                                                'Alias must be less than 25 characters',
                                        ]"
                                    ></v-text-field>

                                    <v-text-field
                                        v-model="expiresAt"
                                        label="Expiration Date (optional)"
                                        type="datetime-local"
                                    ></v-text-field>

                                    <v-btn
                                        type="submit"
                                        color="primary"
                                        block
                                        class="mt-4"
                                    >
                                        Shorten URL
                                    </v-btn>
                                </v-form>
                            </v-card-text>
                        </v-card>

                        <v-card v-if="shortUrl" class="mb-4">
                            <v-card-text>
                                <h2 class="text-h6">Your Short URL:</h2>
                                <a
                                    :href="`http://localhost:3000/${shortUrl}`"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    http://localhost:3000/{{ shortUrl }}
                                </a>
                            </v-card-text>
                        </v-card>

                        <v-card>
                            <v-card-title>Your URLs</v-card-title>
                            <v-card-text>
                                <v-list>
                                    <v-list-item
                                        v-for="url in urls"
                                        :key="url.shortUrl"
                                    >
                                        <template v-slot:prepend>
                                            <v-list-item-title>
                                                <a
                                                    :href="`http://localhost:3000/${url.shortUrl}`"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    {{ url.shortUrl }}
                                                </a>
                                            </v-list-item-title>
                                            <v-list-item-subtitle>{{
                                                url.originalUrl
                                            }}</v-list-item-subtitle>
                                        </template>

                                        <template v-slot:append>
                                            <v-btn
                                                icon="mdi-information"
                                                variant="text"
                                                @click="
                                                    () =>
                                                        handleGetInfo(
                                                            url.shortUrl,
                                                        )
                                                "
                                                class="mr-2"
                                            ></v-btn>
                                            <v-btn
                                                icon="mdi-chart-bar"
                                                variant="text"
                                                @click="
                                                    () =>
                                                        handleGetAnalytics(
                                                            url.shortUrl,
                                                        )
                                                "
                                                class="mr-2"
                                            ></v-btn>
                                            <v-btn
                                                icon="mdi-delete"
                                                variant="text"
                                                @click="
                                                    () =>
                                                        handleDelete(
                                                            url.shortUrl,
                                                        )
                                                "
                                            ></v-btn>
                                        </template>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- URL Info Dialog -->
                <v-dialog v-model="openInfo" max-width="500">
                    <v-card>
                        <v-card-title>URL Information</v-card-title>
                        <v-card-text v-if="urlInfo">
                            <p>
                                <strong>Original URL:</strong>
                                {{ urlInfo.originalUrl }}
                            </p>
                            <p>
                                <strong>Created At:</strong>
                                {{
                                    new Date(urlInfo.createdAt).toLocaleString()
                                }}
                            </p>
                            <p>
                                <strong>Click Count:</strong>
                                {{ urlInfo.clickCount }}
                            </p>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" @click="openInfo = false"
                                >Close</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Analytics Dialog -->
                <v-dialog v-model="openAnalytics" max-width="500">
                    <v-card>
                        <v-card-title>URL Analytics</v-card-title>
                        <v-card-text v-if="analytics">
                            <p>
                                <strong>Total Clicks:</strong>
                                {{ analytics.clickCount }}
                            </p>
                            <h3 class="text-h6 mt-4">Last IP Addresses:</h3>
                            <v-list>
                                <v-list-item
                                    v-for="(ip, index) in analytics.lastIps"
                                    :key="index"
                                >
                                    {{ ip }}
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn
                                color="primary"
                                @click="openAnalytics = false"
                                >Close</v-btn
                            >
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import type { UrlInfo, AnalyticsInfo } from "@/api/api.types";
import * as backApi from "@/api/api";

const url = ref("");
const alias = ref("");
const expiresAt = ref("");
const shortUrl = ref("");
const urls = ref<{ shortUrl: string; originalUrl: string }[]>([]);
const urlInfo = ref<UrlInfo | null>(null);
const analytics = ref<AnalyticsInfo | null>(null);
const openInfo = ref(false);
const openAnalytics = ref(false);

const handleCreate = async () => {
    const response = await backApi.createUrl(
        url.value,
        alias.value,
        expiresAt.value,
    );
    shortUrl.value = response.shortUrl;
    urls.value.push(response);
    url.value = "";
    alias.value = "";
    expiresAt.value = "";
};

const handleDelete = async (shortUrl: string) => {
    await backApi.deleteUrl(shortUrl);
    urls.value = urls.value.filter((u) => u.shortUrl !== shortUrl);
};

const handleGetAnalytics = async (shortUrl: string) => {
    const response = await backApi.getAnalytics(shortUrl);
    analytics.value = response;
    openAnalytics.value = true;
};

const handleGetInfo = async (shortUrl: string) => {
    const response = await backApi.getInfo(shortUrl);
    urlInfo.value = response;
    openInfo.value = true;
};
</script>

<style>
.v-application {
    font-family: "Roboto", sans-serif;
}
</style>
