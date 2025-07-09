
import { LightningElement } from 'lwc';
import LightningToast from "lightning/toast";
import { createRecord } from 'lightning/uiRecordApi';
import ORDER_OBJECT from '@salesforce/schema/Order';
import CONTRACT_OBJECT from '@salesforce/schema/Contract';
import ACCOUNT_ID_FIELD from '@salesforce/schema/Contract.AccountId';
import STATUS_FIELD from '@salesforce/schema/Contract.Status';
import START_DATE_FIELD from '@salesforce/schema/Contract.StartDate';
import CONTRACT_TERM_FIELD from '@salesforce/schema/Contract.ContractTerm';
import BILLING_ADDRESS_FIELD from '@salesforce/schema/Contract.BillingAddress';

export default class CustomOrderLwcForm extends LightningElement {

    //Order Fields
    startDate;
    status;
    accountId;
    contractTerm = 1;
    shippingAddress = {};
    useSameAddress = true;
    billingAddress = {};

    connectedCallback() {
        this.startDate = this.getToday;
        this.status = this.getContractOptions[0].value;
    }

    //OnChange
    handleAccountChange(event) {
        this.accountId = event.detail.value[0];
    }
    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }
    handleStatusChange(event) {
        this.status = event.target.value;
    }
    handleContractTermChange(event) {
        this.contractTerm = event.target.value;
    }
    handleShippingAddressChange(event) {
        this.shippingAddress = {
            street: event.detail.street,
            city: event.detail.city,
            province: event.detail.province,
            postalCode: event.detail.postalCode,
            country: event.detail.country
        }
        if (this.useSameAddress) {
            this.billingAddress = this.shippingAddress;
        }
    }
    handleAddressCheckboxChange(event) {
        this.useSameAddress = event.target.checked;
        if (this.useSameAddress) {
            this.billingAddress = this.shippingAddress;
        }
    }
    handleBillingAddressChange(event) {
        this.billingAddress = {
            street: event.detail.street,
            city: event.detail.city,
            province: event.detail.province,
            postalCode: event.detail.postalCode,
            country: event.detail.country
        }
    }

    async handleSubmit() {
        if (
            !this.startDate ||
            !this.status ||
            !this.accountId ||
            !this.contractTerm ||
            !this.shippingAddress ||
            !this.billingAddress 
        ) {
            await LightningToast.show({
                label: 'Error',
                message: 'Please fill in all required fields.',
                variant: 'error',
                mode: 'sticky'
            }, this);
            return;
        }

        console.log('Creating Order with the following data:');
        await this.createContract();


    }

    async createContract() {

        let contract = null;

        const fields = {};
        fields[ACCOUNT_ID_FIELD.fieldApiName] = this.accountId;
        fields[STATUS_FIELD.fieldApiName] = this.status;
        fields[START_DATE_FIELD.fieldApiName] = this.startDate;
        fields[CONTRACT_TERM_FIELD.fieldApiName] = this.contractTerm;
        fields[BILLING_ADDRESS_FIELD.fieldApiName] = this.billingAddress;

        console.log(JSON.stringify(fields))
        const recordInput = { apiName: CONTRACT_OBJECT.objectApiName, fields };
        try {
            contract = await createRecord(recordInput);
        } catch (error) {
            await LightningToast.show({
                label: 'Error',
                message: `Error creating contract: ${error.body.message}`,
                variant: 'error',
                mode: 'sticky'
            }, this);
        }
        return contract;
    }

    //Helpers
    get getToday() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0'); 
        var mm = String(today.getMonth() + 1).padStart(2, '0');            
        var yyyy = today.getFullYear();
        return yyyy + '-' + mm + '-' + dd;
    }
    get getContractOptions() {
        return [
            {
                label: 'Draft', value: 'Draft'
            },
            {
                label: 'Activated', value: 'Activated'
            },
            {
                label: 'In Approval Process', value: 'In Approval Process'
            }
        ]
    }


}